# CLAUDE.md - SCADA Alarm Manager

## Project Overview

An industrial-style alarm management system for Home Assistant, distributed via HACS.
Domain: `scada_alarm_manager`

## Versioning

- **Semantic Versioning** (SemVer 2.0.0): `MAJOR.MINOR.PATCH`
  - MAJOR: Breaking changes (config schema changes requiring migration, removed features)
  - MINOR: New features, backwards-compatible
  - PATCH: Bug fixes, backwards-compatible
- **Current version**: 0.17.0
- Version is tracked in: `custom_components/scada_alarm_manager/manifest.json` and `pyproject.toml`
- Both files MUST be updated together on version bumps
- **Always bump the PATCH version** when making any code change (bug fix, refactor, etc.). Bump MINOR for new features, MAJOR for breaking changes.
- **EVERY commit to master MUST include a version bump and git tag.** No exceptions.
  - Bump in: `manifest.json`, `pyproject.toml`, `CLAUDE.md` (current version field above)
  - Create tag: `git tag v<version>` (e.g., `v0.3.1`)
  - Remind user to push both: `git push && git push origin v<version>`
  - HACS uses tags for update detection — commits without tags are invisible to users

## Changelog

- Maintain `CHANGELOG.md` using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Every PR that changes user-facing behavior must update the `[Unreleased]` section
- On release: move `[Unreleased]` entries to a versioned section with the release date

## Home Assistant Developer Guidelines

### Python

- **Minimum Python**: 3.13 (HA 2026.1+ compatibility)
- **Async throughout**: All I/O must be async. Never block the event loop.
- **Formatter/Linter**: Ruff (replaces black, isort, flake8)
- **Type checking**: mypy with strict mode
- **Line length**: 120 characters
- **Imports**: Sorted by ruff (isort rules). stdlib → third-party → local.
- **Docstrings**: Required on all public classes and methods. Google style.
- **Entity properties**: Must only return data from memory, never perform I/O.

### Ruff Configuration

Configured in `pyproject.toml` under `[tool.ruff]`. Rules:
- E, F, W (pycodestyle, pyflakes)
- I (isort)
- N (pep8-naming)
- UP (pyupgrade)
- B (bugbear)
- A (builtins)
- C4 (comprehensions)
- SIM (simplify)
- TCH (type-checking imports)

### Testing

- Framework: `pytest` with `pytest-homeassistant-custom-component`
- Async mode: `asyncio_mode = auto` in `pyproject.toml`
- Tests live in `tests/` at project root
- Coverage target: >80%
- Run tests: `pytest tests/`
- Run with coverage: `pytest --cov=custom_components/scada_alarm_manager tests/`

### Translations

- Custom integrations use `translations/` directory (NOT `strings.json` for translations)
- `strings.json` is used for config flow string keys
- `translations/en.json` contains the actual English text
- Language codes: ISO 639-2 two-letter codes (en, de, fr, nb, etc.)
- Cannot reference shared HA core strings — must be self-contained

### HA Integration Conventions

- **Config flow**: UI-based setup via `ConfigFlow` class. This integration is a singleton (one entry only).
- **Options flow**: For modifying settings after setup.
- **Services**: Registered in `async_setup_entry`, described in `services.yaml`.
- **WebSocket API**: Custom commands prefixed with `scada_alarm_manager/`.
- **Events**: Custom events prefixed with `scada_alarm_manager_`.
- **Entity unique_id**: Stable identifier that never changes between restarts.
- **ConfigEntry.runtime_data**: Used for transient runtime data.
- **hass.data[DOMAIN]**: Used for integration-level shared data.

## Project Structure

```
custom_components/scada_alarm_manager/   # The HA integration (shipped via HACS)
frontend/                                 # TypeScript source (NOT shipped)
  └── src/                               # Lit 3 components
tests/                                    # pytest test suite
plan/                                     # Implementation plans (git-ignored)
```

### Key Backend Files

| File | Purpose |
|------|---------|
| `__init__.py` | Integration entry point: setup, teardown, wiring |
| `const.py` | Domain constant, enums (AlarmPriority, AlarmState, TriggerType, AlarmEventType) |
| `models.py` | Dataclasses: AlarmDefinition, AlarmChannel, AlarmRuntimeState, AlarmEvent |
| `state_machine.py` | SCADA state machine — pure functions, no side effects |
| `alarm_manager.py` | Core engine: entity listeners, lifecycle management, periodic tasks |
| `trigger_evaluator.py` | Evaluates analog/digital/custom triggers against entity state |
| `database.py` | SQLite via aiosqlite: schema, CRUD, event logging, migrations |
| `store.py` | HA .storage backup wrapper for alarm/channel definitions |
| `services.py` | HA service registration and handlers |
| `websocket_api.py` | WebSocket command handlers for frontend communication |
| `notification_router.py` | Channel-based notification dispatch (persistent, mobile, critical) |
| `config_flow.py` | Config flow (singleton setup) + options flow |
| `binary_sensor.py` | One BinarySensorEntity per alarm definition |
| `sensor.py` | Summary sensors: active count, unacked count, highest severity |

### Frontend

- **Framework**: Lit 3 (Web Components)
- **Language**: TypeScript 5.x
- **Bundler**: Rollup 4
- **Output**: `custom_components/scada_alarm_manager/frontend/` (committed JS bundles)
- **Build**: `cd frontend && npm run build`
- **Watch mode**: `cd frontend && npm run watch`
- **Two entry points**:
  - `alarm-overview.ts` → Alarm Center panel (`scada-alarm-overview`)
  - `alarm-banner.ts` → compact Lovelace card (`scada-alarm-banner`)

## Database

- **Engine**: SQLite via `aiosqlite`
- **Location**: `{config_dir}/scada_alarm_manager/scada_alarm_manager.db`
- **Journal mode**: WAL (concurrent read safety)
- **Schema versioning**: `schema_version` table with integer version
- **Backup**: Alarm definitions and channels are also written to HA `.storage/` for HA backup compatibility
- **Tables**: `alarm_definitions`, `alarm_channels`, `alarm_events`, `schema_version`

## SCADA Alarm State Machine

Six states: `NORMAL`, `ACTIVE_UNACKED`, `ACTIVE_ACKED`, `RTN_UNACKED`, `SHELVED`, `DISABLED`

The state machine is implemented as pure functions in `state_machine.py`. No I/O, no side effects. Input: current state + action + alarm flags. Output: new state + list of events.

## Development Workflow

### Local Dev Environment

```bash
# Start HA dev instance (Docker)
docker compose up -d

# Access HA at http://localhost:8123

# Frontend development (separate terminal)
cd frontend
npm install
npm run watch

# Run Python tests
pytest tests/

# Run linter
ruff check custom_components/scada_alarm_manager/
ruff format --check custom_components/scada_alarm_manager/
```

### CI/CD

- **hassfest**: Validates manifest.json and integration structure
- **HACS validation**: Validates HACS requirements (hacs.json, structure)
- **pytest**: Runs tests on Python 3.13 and 3.14
- **Release**: Tag `v*` triggers GitHub release with built frontend

### HACS Distribution

- Repository must be public on GitHub
- Required files at root: `hacs.json`, `README.md`
- Integration at: `custom_components/scada_alarm_manager/`
- `manifest.json` must have `version` field matching the release tag

## Commit Conventions

- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Reference issue numbers where applicable: `feat: add alarm shelving (#42)`
- Keep commits atomic — one logical change per commit

## Backlog

- After completing any task, read `plan/backlog.md` for new manual input points.
- Process input points into proper backlog items (bug/feature/task) with acceptance criteria and test points, then move them from the "Manual Input" section to the appropriate "Backlog items" section.
- If a manual input point is unclear, ask the user for clarification before creating the item.

## Code Review Checklist

- [ ] No blocking I/O in async context
- [ ] Entity properties return only from memory
- [ ] All new services documented in `services.yaml`
- [ ] All new WS commands validated with `vol.Schema`
- [ ] Translations updated for new config flow fields
- [ ] Tests added for new functionality
- [ ] `CHANGELOG.md` updated for user-facing changes
- [ ] Version bumped in `manifest.json` and `pyproject.toml` (for releases)
