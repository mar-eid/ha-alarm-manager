# Responsive Table Design Proposal (T1)

> Design-phase deliverable for backlog item **T1** (epic **E1: Responsive frontend**).
> This is a proposal for review — no code is shipped by this document.
> **AI-assisted draft — review by a qualified person before implementing.**

## Problem

The Alarm Center panel (`scada-alarm-overview`) uses wide HTML `<table>` layouts that do not
scale on phones. On a 375 px-wide screen the tables overflow horizontally with no scroll
affordance, pushing the Actions column (ACK / Shelve / Edit / Delete) off-screen — the most
important controls become unreachable. Affected views:

| View | File | Columns today |
|------|------|---------------|
| Active Alarms (table layout) | `frontend/src/views/active-alarms-view.ts` | badge, Name, State, Source, Value, Triggered, Actions |
| All Alarms | `frontend/src/views/all-alarms-view.ts` | Priority, Name, State, Source Entity, Trigger, Channel, Tag, Enabled, Actions |
| History event log | `frontend/src/views/history-view.ts` | (event rows) |

Note the Active view **already has a card layout** toggle (`_layout: "table" | "cards"`,
`alarm-tile-card`). That component is the model the other views should follow.

## Recommended approach: CSS-only stacked cards under a breakpoint

Use a single breakpoint (`max-width: 600px`) and a **label-driven stacked-row** pattern. Each
`<tr>` becomes a card; each `<td>` becomes a labelled row inside it. No JS, no template
duplication — the same table markup reflows via CSS.

Mechanism (shared, add to `shared-styles.ts`):

```css
@media (max-width: 600px) {
  table, thead, tbody, tr, td { display: block; }
  thead { display: none; }            /* header row hidden; labels come from data-label */
  tr {
    margin: 0 0 12px; border: 1px solid var(--divider-color);
    border-radius: 8px; padding: 8px 12px; background: var(--card-background-color);
  }
  td {
    display: flex; justify-content: space-between; gap: 12px;
    padding: 4px 0; border: none; text-align: right;
  }
  td::before {
    content: attr(data-label);          /* row label */
    font-weight: 600; color: var(--secondary-text-color); text-align: left;
  }
  td.actions { justify-content: flex-start; flex-wrap: wrap; }
}
```

Each `<td>` gets a `data-label` attribute (e.g. `<td data-label="Channel">`). The column
filter row (`.filter-row`) is hidden under the breakpoint; filtering on mobile is driven by
the toolbar controls instead (the Active view already has toolbar tag/channel/search filters —
extend the same toolbar pattern to All Alarms rather than relying on per-column filter cells).

### Why this over the alternatives

- **Horizontal scroll wrapper** (`overflow-x:auto`) — simplest, but hides the Actions column
  behind a scroll and reads poorly on touch. Acceptable as a *fallback* for the History log
  only, where rows are informational and have no actions.
- **Per-view bespoke card components** — most polished, but triples the markup to maintain and
  diverges the three views. Reserve for the Active view, which already has `alarm-tile-card`.
- **CSS stacked cards (recommended)** — one shared rule, every table benefits, markup stays
  single-source. Best effort-to-coverage ratio for the epic.

## Layout at 375 px (description)

**All Alarms**, each alarm as a card:

```
┌─────────────────────────────────────┐
│ ●  Kitchen Temp High        [High]  │   ← Name + priority badge (always visible)
│ State        🟠 Active-unacked       │
│ Source       sensor.kitchen_temp     │
│ Channel      Safety                  │
│ Tag          TT-101                  │
│ [ACK] [Shelve] [Edit] [Delete]       │   ← actions wrap, full-width tap targets
└─────────────────────────────────────┘
```

## Essential vs hideable columns on mobile

| Column | Active view | All Alarms | Rationale |
|--------|-------------|------------|-----------|
| Priority badge | **essential** | **essential** | severity is the primary scan signal |
| Name | **essential** | **essential** | identifies the alarm |
| State | **essential** | **essential** | core status |
| Actions | **essential** | **essential** | ACK/Shelve must stay reachable |
| Source entity | secondary | secondary | show in card, lower in stack |
| Value / Triggered | secondary | n/a | show in card |
| Channel / Tag / Trigger / Enabled | hideable | hideable | detail; keep in card but consider collapsing behind the detail modal |

For the densest view (All Alarms, 9 columns), consider hiding Trigger + Enabled entirely on
mobile (they are rarely needed mid-incident) and surfacing them only in the detail modal.

## Verification (when implemented)

- Chrome DevTools device toolbar at 375 px and 414 px — confirm no horizontal page scroll and
  that ACK/Shelve/Edit/Delete are tappable on every row.
- Toggle the Active view between table and cards layouts — both must be usable at 375 px.
- Verify the detail modal (`alarm-detail-dialog`, `max-width: 600px; width: 90%`) is already
  responsive and remains so.

## Suggested implementation slices for E1 (follow-up)

1. Shared stacked-card CSS in `shared-styles.ts` + `data-label` attributes on All Alarms `<td>`s.
2. Same treatment for the History event log (or scroll-wrapper fallback).
3. Active view: ensure table layout reflows (or default to cards under the breakpoint).
4. Toolbar-based filtering on All Alarms for mobile (mirror the Active view toolbar).
