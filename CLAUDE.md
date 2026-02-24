# CLAUDE.md — Platopia Project Context

## What is Platopia?

Platopia is a smart scheduling platform for organizing group gatherings. It combines event description, collaborative scheduling, and confirmation/booking into one flow. Events confirm when a minimum attendance threshold (quorum) is reached.

## Architecture: Experience Catalog

The project is built as a **manifest-driven experience catalog** — a browsable collection of self-contained prototype experiences rendered via React Router with lazy loading.

### Key files

| File | Purpose |
|---|---|
| `src/main.jsx` | Entry point — BrowserRouter with two routes (`/` and `/experience/:id`) |
| `src/catalog/Catalog.jsx` | Landing page — browsable grid grouped by category |
| `src/catalog/ExperienceShell.jsx` | Route wrapper — floating back bar + Suspense + lazy load |
| `src/experiences/manifest.js` | Central registry — experience metadata + lazy `import()` functions |
| `src/shared/styles.js` | Brand constants (COLORS, GRADIENTS, FONTS) |
| `src/shared/icons.jsx` | SVG icon components used in manifest/catalog |

### Folder structure

```
src/
  main.jsx
  shared/
    styles.js
    icons.jsx
  catalog/
    Catalog.jsx
    ExperienceShell.jsx
  experiences/
    manifest.js
    shared/styles.js          ← proxy re-export for moved experience files
    scheduling/
      HostSchedulingForm.jsx
      InviteeExperience.jsx
      InviteeCalendarExperience.jsx
      HostCombinedForm.jsx
    messaging/                 ← empty scaffold
    social/                    ← empty scaffold
```

### Adding a new experience

1. Create a JSX file in the appropriate category folder (e.g., `src/experiences/scheduling/`)
2. Export a default component that accepts `{ onBack }` prop
3. Add an entry to `src/experiences/manifest.js` with `load: () => import("./category/File.jsx")`
4. The catalog and routing pick it up automatically

### Conventions

- **Inline styles only** — no CSS files, no UI framework
- **Self-contained experiences** — each experience file owns its own state and styles
- **`onBack` prop contract** — every experience receives `onBack` for navigation back to catalog
- **Lazy loading** — experiences are code-split via `React.lazy()` + dynamic `import()`

## Core Design Principles

1. **Locations are participants** — locations have their own availability and are matched alongside people and times. Matching is three-dimensional: people × times × places.
2. **Quorum-based confirmation** — events lock in when the minimum attendee threshold is met, not when everyone responds.
3. **Availability sets** — hosts define multiple date/time combinations. Each set pairs a group of dates with a time window.
4. **Overflow gatherings** — if demand exceeds capacity, additional sessions are automatically offered from remaining slots.

## Event Types

- **Single event** — one-time gathering with availability sets (dates + time windows)
- **Recurring series** — regular cadence (e.g., "2nd and 4th Thursdays"); invitees vote once
- **Limited series** — set number of sessions over a period (e.g., "twice in 2 weeks")

## Key Docs

- `docs/user-journey.md` — full user journey (v2)
- `docs/elevator-pitch.md` — product pitch with differentiators
- `diagrams/detailed-flow.mermaid` — detailed Mermaid flowchart
- `diagrams/high-level-flow.mermaid` — simplified flow

## Tech Stack

- React 18 + Vite 6
- React Router v7 (react-router-dom)
- Inline styles only — no CSS framework
- No backend architecture decided yet
