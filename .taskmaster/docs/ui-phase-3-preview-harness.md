UI Output Phase 3 — Preview Harness (Storybook)
==============================================

References: `.taskmaster/docs/improved-prd.md`, `input/prd1.txt`, Lovable guidelines in `Lovable/`.

Approach
--------
- Use Storybook to preview and QA component states and interactions offline (no data upload).
- Include stories for all primary components and stateful scenarios, mapping to acceptance criteria where relevant.

Setup (when project scaffold exists)
-----------------------------------
```bash
npx storybook@latest init --type react
```

Key Stories (Examples)
----------------------
- `Uploader` — empty, drag‑over, choosing files, parse progress
- `SheetTabs` — 1 tab, many tabs, tab with unsaved edits badge
- `Toolbar` — search input with value; export menu open; reset layout confirmation
- `GridView`
  - Small dataset (memory)
  - Large dataset (indexeddb/performance banner)
  - Sorted (single & multi)
  - Filtered (text/numeric)
  - Inline editing (dirty cells visible)
- `WarningsPanel` — warnings populated; parse options variants
- `StatusBar` — progress, rows/cols, perf indicator

Story Skeleton (example for `GridView`)
---------------------------------------
```ts
import type { Meta, StoryObj } from '@storybook/react';
import { GridView } from './GridView';

const meta: Meta<typeof GridView> = {
  title: 'Components/GridView',
  component: GridView,
};
export default meta;

export const SmallDataset: StoryObj<typeof GridView> = {
  args: { /* mocked adapter + headers + viewState */ },
};

export const PerformanceMode: StoryObj<typeof GridView> = {
  args: { /* adapter wired to mock IndexedDB blocks; perf banner = true */ },
};
```

Mapping to Acceptance Criteria
------------------------------
- AC1: `Uploader` + `GridView.SmallDataset` (preview time proxy via mocked progress)
- AC3: `GridView` with reorder persisted across stories (simulate localStorage)
- AC4: Stories for sort/filter states
- AC5: Inline edit + undo/redo via controlled state
- AC7: `PerformanceMode` story with large data adapter mock
- AC8: Export flows validated via utility stories (simulate Blob generation)
- AC10: Keyboard interaction tests via Storybook play functions

QA Tips
-------
- Use Storybook Controls for toggling filters, sorts, density
- Log performance metrics in the console option toggles
- Add a11y addon to check contrast and aria attributes


