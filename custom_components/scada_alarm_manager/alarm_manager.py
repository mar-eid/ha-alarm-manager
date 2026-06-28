"""Core alarm manager engine."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, State, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from . import state_machine as sm
from .const import (
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    EVENT_ALARM_STATE_CHANGED,
    AlarmEventType,
    AlarmPriority,
    AlarmState,
    TriggerType,
)
from .database import AlarmDatabase
from .models import AlarmChannel, AlarmDefinition, AlarmEvent, AlarmRuntimeState
from .store import AlarmStore
from .trigger_evaluator import TriggerEvaluator

if TYPE_CHECKING:
    from homeassistant.helpers.event import EventStateChangedData

_LOGGER = logging.getLogger(__name__)


class AlarmManager:
    """Central runtime engine for alarm management."""

    def __init__(
        self,
        hass: HomeAssistant,
        database: AlarmDatabase,
        store: AlarmStore,
    ) -> None:
        self.hass = hass
        self._database = database
        self._store = store
        self._trigger_evaluator = TriggerEvaluator()

        # Runtime data
        self._alarms: dict[str, AlarmDefinition] = {}
        self._channels: dict[str, AlarmChannel] = {}
        self._runtime_states: dict[str, AlarmRuntimeState] = {}

        # Listeners and tasks
        self._state_listeners: dict[str, CALLBACK_TYPE] = {}
        self._periodic_task: CALLBACK_TYPE | None = None
        self._notification_router: Any = None

        # Pending trigger on-delay / clear-delay timers, keyed by alarm id.
        # Value is (kind, cancel) where kind is "activate" or "clear".
        self._pending_delays: dict[str, tuple[str, CALLBACK_TYPE]] = {}

        # Callbacks for entity updates
        self._entity_update_callbacks: list[Any] = []

        # Suppress notifications during initial evaluation on startup
        self._suppress_notifications = False

    @property
    def alarms(self) -> dict[str, AlarmDefinition]:
        """Return all alarm definitions."""
        return self._alarms

    @property
    def channels(self) -> dict[str, AlarmChannel]:
        """Return all alarm channels."""
        return self._channels

    @property
    def runtime_states(self) -> dict[str, AlarmRuntimeState]:
        """Return all runtime states."""
        return self._runtime_states

    def set_notification_router(self, router: Any) -> None:
        """Set the notification router instance."""
        self._notification_router = router

    def register_entity_update_callback(self, callback_func: Any) -> None:
        """Register a callback for when entity states should be updated."""
        self._entity_update_callbacks.append(callback_func)

    def unregister_entity_update_callback(self, callback_func: Any) -> None:
        """Unregister an entity update callback."""
        if callback_func in self._entity_update_callbacks:
            self._entity_update_callbacks.remove(callback_func)

    async def async_start(self) -> None:
        """Start the alarm manager."""
        # Load alarm definitions
        alarms = await self._database.async_list_alarms()
        for alarm in alarms:
            self._alarms[alarm.id] = alarm

        # Restore persisted runtime states
        saved_states = await self._database.async_load_runtime_states()
        for alarm in alarms:
            if alarm.id in saved_states:
                runtime = saved_states[alarm.id]
                # If alarm was disabled in config, force disabled state
                if not alarm.enabled:
                    runtime = AlarmRuntimeState(
                        alarm_id=alarm.id, state=AlarmState.DISABLED
                    )
                self._runtime_states[alarm.id] = runtime
                _LOGGER.debug(
                    "Restored runtime state for %s: %s",
                    alarm.name,
                    runtime.state.value,
                )
            else:
                self._runtime_states[alarm.id] = AlarmRuntimeState(
                    alarm_id=alarm.id,
                    state=AlarmState.DISABLED if not alarm.enabled else AlarmState.NORMAL,
                )

        # Load channels
        channels = await self._database.async_list_channels()
        for channel in channels:
            self._channels[channel.id] = channel

        # Sync store backup
        await self._store.async_save(alarms, channels)

        # Set up entity listeners for all watched entities
        self._setup_entity_listeners()

        # Evaluate current state — but don't re-notify already-active alarms
        await self._async_initial_evaluation()

        # Start periodic task for shelve timeouts and repeat notifications
        self._start_periodic_task()

        _LOGGER.info(
            "Alarm manager started with %d alarms and %d channels (%d states restored)",
            len(self._alarms),
            len(self._channels),
            len(saved_states),
        )

    async def async_stop(self) -> None:
        """Stop the alarm manager."""
        # Cancel all state listeners
        for unsub in self._state_listeners.values():
            unsub()
        self._state_listeners.clear()

        # Cancel periodic task
        if self._periodic_task:
            self._periodic_task()
            self._periodic_task = None

        # Cancel any pending debounce timers
        for _kind, cancel in self._pending_delays.values():
            cancel()
        self._pending_delays.clear()

        _LOGGER.info("Alarm manager stopped")

    # --- Alarm CRUD ---

    async def async_create_alarm(self, alarm: AlarmDefinition) -> AlarmDefinition:
        """Create a new alarm definition."""
        await self._database.async_create_alarm(alarm)
        self._alarms[alarm.id] = alarm
        self._runtime_states[alarm.id] = AlarmRuntimeState(
            alarm_id=alarm.id,
            state=AlarmState.DISABLED if not alarm.enabled else AlarmState.NORMAL,
        )

        # Log creation event
        event = AlarmEvent(
            alarm_id=alarm.id,
            event_type=AlarmEventType.CREATED,
        )
        await self._database.async_log_event(event)

        # Set up listener for this alarm's source entity
        self._add_entity_listener(alarm)

        # Evaluate initial state
        if alarm.enabled:
            entity_state = self.hass.states.get(alarm.source_entity_id)
            await self._async_evaluate_alarm(alarm, entity_state)

        # Sync store
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )

        # Notify entity platforms
        self._notify_entity_updates()

        return alarm

    async def async_update_alarm(self, alarm: AlarmDefinition) -> AlarmDefinition:
        """Update an existing alarm definition."""
        old_alarm = self._alarms.get(alarm.id)
        await self._database.async_update_alarm(alarm)
        self._alarms[alarm.id] = alarm

        # The definition may have changed entity/trigger/delays — drop any pending
        # debounce timer; the re-evaluation below re-arms it if still applicable.
        self._cancel_pending_delay(alarm.id)

        # If source entity changed, update listener
        if old_alarm and old_alarm.source_entity_id != alarm.source_entity_id:
            self._remove_entity_listener(old_alarm)
            self._add_entity_listener(alarm)

        # Log update event
        event = AlarmEvent(
            alarm_id=alarm.id,
            event_type=AlarmEventType.UPDATED,
        )
        await self._database.async_log_event(event)

        # Re-evaluate
        if alarm.enabled:
            entity_state = self.hass.states.get(alarm.source_entity_id)
            await self._async_evaluate_alarm(alarm, entity_state)

        # Sync store
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )

        self._notify_entity_updates()
        return alarm

    async def async_delete_alarm(self, alarm_id: str) -> None:
        """Delete an alarm definition."""
        alarm = self._alarms.get(alarm_id)
        if alarm is None:
            return

        # Log deletion event
        event = AlarmEvent(
            alarm_id=alarm_id,
            event_type=AlarmEventType.DELETED,
        )
        await self._database.async_log_event(event)

        # Remove listener
        self._remove_entity_listener(alarm)

        # Cancel any pending debounce timer
        self._cancel_pending_delay(alarm_id)

        # Remove from runtime
        self._alarms.pop(alarm_id, None)
        self._runtime_states.pop(alarm_id, None)

        await self._database.async_delete_alarm(alarm_id)
        await self._database.async_delete_runtime_state(alarm_id)

        # Sync store
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )

        self._notify_entity_updates()

    # --- Channel CRUD ---

    async def async_create_channel(self, channel: AlarmChannel) -> AlarmChannel:
        """Create a new alarm channel."""
        await self._database.async_create_channel(channel)
        self._channels[channel.id] = channel
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )
        return channel

    async def async_update_channel(self, channel: AlarmChannel) -> AlarmChannel:
        """Update an existing alarm channel."""
        await self._database.async_update_channel(channel)
        self._channels[channel.id] = channel
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )
        return channel

    async def async_delete_channel(self, channel_id: str) -> None:
        """Delete an alarm channel."""
        self._channels.pop(channel_id, None)
        await self._database.async_delete_channel(channel_id)
        await self._store.async_save(
            list(self._alarms.values()), list(self._channels.values())
        )

    # --- Alarm Actions ---

    async def async_acknowledge(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Acknowledge an alarm."""
        runtime = self._runtime_states.get(alarm_id)
        if runtime is None:
            return

        new_runtime, events = sm.acknowledge(runtime, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

    async def async_acknowledge_all(
        self,
        channel_id: str | None = None,
        priority: AlarmPriority | None = None,
        user: str | None = None,
    ) -> int:
        """Acknowledge all matching alarms. Returns count acknowledged."""
        count = 0
        for alarm_id, runtime in list(self._runtime_states.items()):
            if runtime.state not in (AlarmState.ACTIVE_UNACKED, AlarmState.RTN_UNACKED):
                continue

            alarm = self._alarms.get(alarm_id)
            if alarm is None:
                continue

            if channel_id and alarm.channel_id != channel_id:
                continue
            if priority is not None and alarm.priority != priority:
                continue

            new_runtime, events = sm.acknowledge(runtime, user)
            await self._async_apply_transition(alarm_id, new_runtime, events)
            count += 1

        return count

    async def async_shelve(
        self,
        alarm_id: str,
        duration_minutes: int,
        user: str | None = None,
    ) -> None:
        """Shelve an alarm."""
        runtime = self._runtime_states.get(alarm_id)
        if runtime is None:
            return

        # Drop any pending debounce timer — shelving overrides a pending activation.
        self._cancel_pending_delay(alarm_id)
        new_runtime, events = sm.shelve(runtime, duration_minutes, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

    async def async_unshelve(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Unshelve an alarm."""
        runtime = self._runtime_states.get(alarm_id)
        if runtime is None:
            return

        new_runtime, events = sm.unshelve(runtime, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

        # Re-evaluate trigger after unshelve
        alarm = self._alarms.get(alarm_id)
        if alarm and alarm.enabled:
            entity_state = self.hass.states.get(alarm.source_entity_id)
            await self._async_evaluate_alarm(alarm, entity_state)

    async def async_enable(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Enable a disabled alarm."""
        runtime = self._runtime_states.get(alarm_id)
        if runtime is None:
            return

        alarm = self._alarms.get(alarm_id)
        if alarm is None:
            return

        new_runtime, events = sm.enable(runtime, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

        # Update definition
        alarm.enabled = True
        await self._database.async_update_alarm(alarm)

        # Re-evaluate trigger
        entity_state = self.hass.states.get(alarm.source_entity_id)
        await self._async_evaluate_alarm(alarm, entity_state)

    async def async_disable(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Disable an alarm."""
        runtime = self._runtime_states.get(alarm_id)
        if runtime is None:
            return

        alarm = self._alarms.get(alarm_id)
        if alarm is None:
            return

        # Drop any pending debounce timer — a disabled alarm must not activate later.
        self._cancel_pending_delay(alarm_id)
        new_runtime, events = sm.disable(runtime, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

        # Update definition
        alarm.enabled = False
        await self._database.async_update_alarm(alarm)

    async def async_reset(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Reset a latched alarm."""
        runtime = self._runtime_states.get(alarm_id)
        alarm = self._alarms.get(alarm_id)
        if runtime is None or alarm is None:
            return

        # Check if condition is still active
        entity_state = self.hass.states.get(alarm.source_entity_id)
        condition_active = self._trigger_evaluator.evaluate(alarm, entity_state)

        new_runtime, events = sm.reset(runtime, alarm, condition_active, user)
        await self._async_apply_transition(alarm_id, new_runtime, events)

    # --- External trigger/clear ---

    async def async_trigger_external(
        self, alarm_id: str, message: str | None = None, user: str | None = None
    ) -> None:
        """Externally trigger an alarm (for external trigger type)."""
        runtime = self._runtime_states.get(alarm_id)
        alarm = self._alarms.get(alarm_id)
        if runtime is None or alarm is None:
            return

        value = message or "externally triggered"
        new_runtime, events = sm.condition_met(runtime, alarm, value)
        await self._async_apply_transition(alarm_id, new_runtime, events)

    async def async_clear_external(
        self, alarm_id: str, user: str | None = None
    ) -> None:
        """Externally clear an alarm (for external trigger type)."""
        runtime = self._runtime_states.get(alarm_id)
        alarm = self._alarms.get(alarm_id)
        if runtime is None or alarm is None:
            return

        new_runtime, events = sm.condition_cleared(runtime, alarm, None)
        await self._async_apply_transition(alarm_id, new_runtime, events)

    # --- Summary accessors ---

    def get_active_count(self) -> int:
        """Count alarms in any active state."""
        return sum(
            1
            for r in self._runtime_states.values()
            if r.state in (AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED)
        )

    def get_unacked_count(self) -> int:
        """Count unacknowledged alarms."""
        return sum(
            1
            for r in self._runtime_states.values()
            if r.state in (AlarmState.ACTIVE_UNACKED, AlarmState.RTN_UNACKED)
        )

    def get_highest_severity(self) -> AlarmPriority | None:
        """Get the highest priority among active alarms."""
        highest: AlarmPriority | None = None
        for runtime in self._runtime_states.values():
            if runtime.state not in (
                AlarmState.ACTIVE_UNACKED,
                AlarmState.ACTIVE_ACKED,
                AlarmState.RTN_UNACKED,
            ):
                continue
            alarm = self._alarms.get(runtime.alarm_id)
            if alarm and (highest is None or alarm.priority > highest):
                highest = alarm.priority
        return highest

    # --- Internal methods ---

    async def _async_apply_transition(
        self,
        alarm_id: str,
        new_runtime: AlarmRuntimeState,
        events: list[AlarmEvent],
    ) -> None:
        """Apply a state transition and handle side effects."""
        old_runtime = self._runtime_states.get(alarm_id)
        if old_runtime is None:
            return

        if new_runtime.state == old_runtime.state and not events:
            return

        self._runtime_states[alarm_id] = new_runtime

        # Persist runtime state to database
        await self._database.async_save_runtime_state(new_runtime)

        # Log events to database
        for event in events:
            await self._database.async_log_event(event)

        # Fire HA event
        alarm = self._alarms.get(alarm_id)
        if alarm:
            self.hass.bus.async_fire(
                EVENT_ALARM_STATE_CHANGED,
                {
                    "alarm_id": alarm_id,
                    "alarm_name": alarm.name,
                    "old_state": old_runtime.state.value,
                    "new_state": new_runtime.state.value,
                    "priority": alarm.priority.value,
                    "priority_name": alarm.priority.name.lower(),
                    "channel_id": alarm.channel_id,
                },
            )

        # Notify entity platforms
        self._notify_entity_updates()

        # Handle notifications (suppressed during initial evaluation on startup)
        if self._notification_router and alarm and not self._suppress_notifications:
            if new_runtime.state == AlarmState.ACTIVE_UNACKED and old_runtime.state != AlarmState.ACTIVE_UNACKED:
                await self._notification_router.async_send_alarm_notification(
                    alarm, new_runtime
                )
            elif new_runtime.state == AlarmState.NORMAL and old_runtime.state != AlarmState.NORMAL:
                await self._notification_router.async_dismiss_alarm_notification(
                    alarm
                )

    async def _async_evaluate_alarm(
        self, alarm: AlarmDefinition, entity_state: State | None
    ) -> None:
        """Evaluate an alarm against current entity state."""
        runtime = self._runtime_states.get(alarm.id)
        if runtime is None or runtime.state == AlarmState.DISABLED:
            return

        # Don't clear active alarms based on unavailable/unknown entity state
        # — the entity may just be temporarily offline during startup
        if entity_state is None or entity_state.state in ("unavailable", "unknown"):
            if runtime.state != AlarmState.NORMAL:
                return  # Keep current state, don't clear

        is_active = runtime.state in (
            AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED
        )
        trigger_active = self._trigger_evaluator.evaluate(alarm, entity_state, is_active=is_active)
        value = entity_state.state if entity_state else None

        # Check optional condition_template (e.g. "car must be home")
        condition_met = trigger_active
        if trigger_active and alarm.condition_template:
            condition_met = self._trigger_evaluator.evaluate_condition_template(
                self.hass, alarm
            )

        # Debounce: gate the transition behind a configurable delay.
        #   - on-delay  (trigger_delay): condition must hold for N s before activating
        #   - clear-delay (clear_delay): condition must stay cleared for N s before normalizing
        pending = self._pending_delays.get(alarm.id)

        if condition_met and not is_active and alarm.trigger_delay:
            # Want to activate; start (or keep) the on-delay timer.
            if pending is None or pending[0] != "activate":
                self._start_pending_delay(alarm.id, "activate", alarm.trigger_delay)
            return
        if not condition_met and is_active and alarm.clear_delay:
            # Want to clear; start (or keep) the clear-delay timer.
            if pending is None or pending[0] != "clear":
                self._start_pending_delay(alarm.id, "clear", alarm.clear_delay)
            return

        # No delay applies (or the condition reverted before a pending timer fired):
        # drop any stale timer and apply the transition immediately.
        self._cancel_pending_delay(alarm.id)
        if condition_met:
            new_runtime, events = sm.condition_met(runtime, alarm, value)
        else:
            new_runtime, events = sm.condition_cleared(runtime, alarm, value)

        await self._async_apply_transition(alarm.id, new_runtime, events)

    def _start_pending_delay(self, alarm_id: str, kind: str, delay_s: int) -> None:
        """Start (replacing any existing) a debounce timer for an alarm."""
        self._cancel_pending_delay(alarm_id)

        @callback
        def _fire(_now: datetime) -> None:
            self._pending_delays.pop(alarm_id, None)
            self.hass.async_create_task(self._async_delay_fired(alarm_id, kind))

        cancel = async_call_later(self.hass, float(delay_s), _fire)
        self._pending_delays[alarm_id] = (kind, cancel)

    def _cancel_pending_delay(self, alarm_id: str) -> None:
        """Cancel and forget any pending debounce timer for an alarm."""
        pending = self._pending_delays.pop(alarm_id, None)
        if pending is not None:
            pending[1]()

    async def _async_delay_fired(self, alarm_id: str, kind: str) -> None:
        """Apply a debounced transition, but only if its premise still holds."""
        alarm = self._alarms.get(alarm_id)
        runtime = self._runtime_states.get(alarm_id)
        if alarm is None or runtime is None or runtime.state == AlarmState.DISABLED:
            return

        entity_state = self.hass.states.get(alarm.source_entity_id)
        # Mirror the main guard: never act on an unavailable/unknown entity.
        if entity_state is None or entity_state.state in ("unavailable", "unknown"):
            return

        is_active = runtime.state in (
            AlarmState.ACTIVE_UNACKED, AlarmState.ACTIVE_ACKED, AlarmState.RTN_UNACKED
        )
        trigger_active = self._trigger_evaluator.evaluate(alarm, entity_state, is_active=is_active)
        value = entity_state.state
        condition_met = trigger_active
        if trigger_active and alarm.condition_template:
            condition_met = self._trigger_evaluator.evaluate_condition_template(
                self.hass, alarm
            )

        if kind == "activate" and condition_met and not is_active:
            new_runtime, events = sm.condition_met(runtime, alarm, value)
            await self._async_apply_transition(alarm_id, new_runtime, events)
        elif kind == "clear" and not condition_met and is_active:
            new_runtime, events = sm.condition_cleared(runtime, alarm, value)
            await self._async_apply_transition(alarm_id, new_runtime, events)

    @callback
    def _async_handle_state_change(self, event: Event[EventStateChangedData]) -> None:
        """Handle entity state change event."""
        entity_id = event.data["entity_id"]
        new_state = event.data.get("new_state")

        for alarm in self._alarms.values():
            if alarm.source_entity_id == entity_id and alarm.enabled:
                self.hass.async_create_task(
                    self._async_evaluate_alarm(alarm, new_state)
                )

    def _setup_entity_listeners(self) -> None:
        """Set up state change listeners for all watched entities."""
        entity_ids: set[str] = set()
        for alarm in self._alarms.values():
            if alarm.enabled and alarm.trigger_type != TriggerType.EXTERNAL:
                entity_ids.add(alarm.source_entity_id)

        if entity_ids:
            unsub = async_track_state_change_event(
                self.hass,
                list(entity_ids),
                self._async_handle_state_change,
            )
            self._state_listeners["__all__"] = unsub

    def _add_entity_listener(self, alarm: AlarmDefinition) -> None:
        """Add listener for a specific alarm's entity."""
        # Remove and recreate the combined listener
        if "__all__" in self._state_listeners:
            self._state_listeners["__all__"]()
            del self._state_listeners["__all__"]

        self._setup_entity_listeners()

    def _remove_entity_listener(self, alarm: AlarmDefinition) -> None:
        """Remove listener for a specific alarm's entity."""
        # Recreate listeners without this alarm's entity
        if "__all__" in self._state_listeners:
            self._state_listeners["__all__"]()
            del self._state_listeners["__all__"]

        self._setup_entity_listeners()

    async def _async_initial_evaluation(self) -> None:
        """Evaluate all alarms against current entity states on startup.

        Skips evaluation for alarms with persisted active states when the
        entity isn't available yet — prevents clearing acknowledged alarms
        during startup when entities haven't loaded.
        """
        self._suppress_notifications = True
        for alarm in self._alarms.values():
            if alarm.enabled and alarm.trigger_type != TriggerType.EXTERNAL:
                entity_state = self.hass.states.get(alarm.source_entity_id)
                runtime = self._runtime_states.get(alarm.id)

                # If alarm has a persisted non-normal state and entity isn't
                # available yet, skip — don't clear it based on missing data
                if runtime and runtime.state != AlarmState.NORMAL:
                    if entity_state is None or entity_state.state in ("unavailable", "unknown"):
                        _LOGGER.debug(
                            "Skipping initial eval for %s (state=%s, entity not ready)",
                            alarm.name,
                            runtime.state.value,
                        )
                        continue

                await self._async_evaluate_alarm(alarm, entity_state)
        self._suppress_notifications = False

    def _start_periodic_task(self) -> None:
        """Start periodic task for shelve timeouts and notification repeats."""
        from homeassistant.helpers.event import async_track_time_interval

        self._periodic_task = async_track_time_interval(
            self.hass,
            self._async_periodic_check,
            timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

    async def _async_periodic_check(self, now: datetime) -> None:
        """Periodic check for shelve expirations and notification repeats."""
        utc_now = datetime.now(timezone.utc)

        # Check shelve expirations
        for alarm_id, runtime in list(self._runtime_states.items()):
            if (
                runtime.state == AlarmState.SHELVED
                and runtime.shelved_until
                and utc_now >= runtime.shelved_until
            ):
                _LOGGER.info("Shelve expired for alarm %s", alarm_id)
                await self.async_unshelve(alarm_id, user="system")

        # Check notification repeats (reminders for unacknowledged alarms)
        if self._notification_router:
            for alarm_id, runtime in list(self._runtime_states.items()):
                if runtime.state != AlarmState.ACTIVE_UNACKED:
                    continue

                alarm = self._alarms.get(alarm_id)
                if alarm is None:
                    continue

                # The alarm's own remind interval takes precedence over the
                # channel's repeat cadence; both are expressed in seconds.
                channel = self._channels.get(alarm.channel_id) if alarm.channel_id else None
                repeat_cadence = (
                    channel.repeat_cadence if channel and channel.repeat_cadence else None
                )
                interval = alarm.repeat_interval or repeat_cadence
                if not interval:
                    continue

                # last_notification_at is not persisted at initial send time, so
                # fall back to triggered_at to keep the reminder clock ticking
                # across restarts.
                baseline = runtime.last_notification_at or runtime.triggered_at
                if baseline is None:
                    continue

                elapsed = (utc_now - baseline).total_seconds()
                if elapsed >= interval:
                    await self._notification_router.async_send_alarm_notification(
                        alarm, runtime, is_repeat=True
                    )
                    updated = AlarmRuntimeState(
                        alarm_id=runtime.alarm_id,
                        state=runtime.state,
                        triggered_at=runtime.triggered_at,
                        acked_at=runtime.acked_at,
                        acked_by=runtime.acked_by,
                        shelved_until=runtime.shelved_until,
                        previous_state=runtime.previous_state,
                        last_notification_at=utc_now,
                        last_value=runtime.last_value,
                    )
                    self._runtime_states[alarm_id] = updated
                    await self._database.async_save_runtime_state(updated)

    @callback
    def _notify_entity_updates(self) -> None:
        """Notify entity platforms to update their state."""
        for cb in self._entity_update_callbacks:
            cb()
