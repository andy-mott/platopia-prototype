# Platopia

A smart scheduling platform for organizing group gatherings, built as a manifest-driven experience catalog.

## Project Structure

```
platopia-prototype/
├── CLAUDE.md                          # Context file for Claude Code sessions
├── README.md                          # This file
├── docs/
│   ├── user-journey.md                # Full user journey (v2)
│   └── elevator-pitch.md             # Product pitch with differentiators
├── diagrams/
│   ├── detailed-flow.mermaid          # Detailed Mermaid flowchart (LR)
│   └── high-level-flow.mermaid        # Simplified high-level flow (LR)
└── src/
    ├── main.jsx                       # Entry point (BrowserRouter + Routes)
    ├── shared/
    │   ├── styles.js                  # Brand constants (COLORS, GRADIENTS, FONTS)
    │   └── icons.jsx                  # SVG icon components
    ├── catalog/
    │   ├── Catalog.jsx                # Browsable grid grouped by category
    │   └── ExperienceShell.jsx        # Route wrapper (back bar + Suspense)
    └── experiences/
        ├── manifest.js                # Central registry with lazy imports
        └── scheduling/
            ├── HostSchedulingForm.jsx
            ├── InviteeExperience.jsx
            ├── InviteeCalendarExperience.jsx
            └── HostCombinedForm.jsx
```

## Getting Started

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Key Concepts

- **Quorum** — minimum attendees needed to confirm a gathering
- **Availability sets** — groups of dates paired with time windows
- **Locations as participants** — locations have availability and are matched alongside people
- **Overflow** — excess demand spawns new gatherings from remaining slots
