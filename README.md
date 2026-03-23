# TaskSphere

TaskSphere is a responsive multi-view project tracker built with React, TypeScript, and Vite. It presents the same shared task dataset in three coordinated views: Kanban, List, and Timeline. The UI is designed to stay usable across phone, tablet, laptop, and large desktop screens while keeping interactions lightweight and custom.

## Live Demo

https://tasksphere-9ze4.onrender.com

## UI Snapshot

The current interface includes:

- a large editorial-style hero section
- responsive view switching between Kanban, List, and Timeline
- pill-based filter controls for status, priority, assignee, and due date range
- a simulated collaboration strip with active viewers and inline presence markers
- desktop-specific spacing polish and mobile-friendly reflow behavior

## Core Features

- Three synchronized views powered by one in-memory task source
- Custom pointer-based drag and drop in the Kanban board
- Virtualized List view for large task volumes
- Month timeline with current-day marker and task bars
- URL-synced view, sort, and filter state
- Simulated live collaboration presence that moves across tasks
- Responsive layout behavior from mobile to large desktop
- Empty-state handling and due-date edge cases

## Views

### Kanban

- Four workflow columns: To Do, In Progress, In Review, Done
- Scrollable columns with draggable task cards
- Placeholder + drag ghost interaction without external drag libraries

### List

- Sortable columns for title, priority, and due date
- Fixed-row virtualization for smooth rendering with 500+ items
- Horizontal safety on smaller widths and cleaner centering on large screens

### Timeline

- Month-based horizontal schedule view
- Current-day indicator
- Single-day markers for tasks without a start date

## Filters And State

- Status filter
- Priority filter
- Assignee filter
- Due date range filter
- URL query hydration and browser back/forward support

State is managed with React Context and `useReducer`, which keeps updates explicit while sharing the same source of truth across all three views.

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS Modules
- React Context + `useReducer`

## Project Structure

```text
src/
  components/      UI views and shared interface pieces
  data/            deterministic task generation
  state/           context, reducer, and shared board logic
  utils/           date and formatting helpers
  constants.ts     labels, defaults, and view metadata
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Data Model

The seeded dataset is generated in `src/data/generateTasks.ts`.

Current seed setup:

- 560 deterministic tasks
- 6 assignees
- 4 priorities
- 4 workflow statuses
- mixed date ranges
- overdue tasks
- tasks with missing start dates

## Interaction Notes

### Why custom drag and drop?

The Kanban interaction uses native pointer events instead of a drag-and-drop package. This keeps the behavior easy to reason about and shows the underlying implementation more clearly. A dragged card is measured, replaced by a placeholder, and rendered as a floating ghost until drop.

### Why virtual scrolling?

The List view uses fixed-height virtualization so the UI stays smooth with a large seeded dataset. Only the visible rows and a small buffer are rendered, while the full scroll height is preserved.

### Why Context + useReducer?

This app has one shared board state, a small set of predictable writes, and multiple views that need to stay in sync. Context with `useReducer` was enough to keep the architecture simple without adding an external state library.

## Responsive Design Summary

The UI has been tuned for:

- mobile stacking and full-width controls
- tablet reflow for filters and board content
- controlled horizontal overflow where dense data needs it
- large-screen balancing for hero content, summary spacing, and board/list proportions

## Lighthouse

Desktop Lighthouse score captured locally against the production build: `97` performance.

![Lighthouse desktop report](./lighthouse-desktop.png)

Artifacts:

- `lighthouse-report.report.html`
- `lighthouse-report.report.json`

## Challenges And Tradeoffs

The most sensitive part of the UI was keeping the Kanban drag interaction stable while also supporting responsive layout changes. The placeholder/ghost approach prevents column collapse and avoids card jumping during drag. On the layout side, the larger challenge was making the same interface feel balanced on both small screens and wide desktop monitors without changing the core interaction model between breakpoints.

If I extended this further, I would improve presence positioning so it reacts even more precisely to scroll and resize events, and I would add richer board operations such as task detail panels or inline editing.
