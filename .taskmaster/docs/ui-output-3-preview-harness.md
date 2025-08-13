## UI Output 3: Preview Harness (Storybook‑style outline)

References: `./prd-improved.md`, `Lovable/` patterns.

### Goal
Provide a preview harness to review component states and interactions without a backend.

### Suggested Setup
- Tool: Storybook for React (or Vite preview pages if Storybook not desired).
- Stories by component with critical states and interactions.

### Stories Outline
- Uploader
  - Idle dropzone
  - Dragging
  - Parsing with progress
  - Error state

- SheetTabs
  - No files
  - One tab active
  - Multiple tabs with dirty badge and close confirmation

- Toolbar
  - Edit mode off/on
  - Export menu open
  - Search active

- GridView
  - Empty
  - Preview (first 50k)
  - Performance mode banner
  - Inline edit with dirty cells
  - Filters applied (text/numeric)

- ColumnMenu
  - Text filter variants
  - Numeric filter variants

- WarningsPanel
  - With multiple warnings and snippet expansion

- StatusBar
  - Normal vs performance mode; with progress and memory estimate

### Example Story Skeletons

```tsx
// stories/GridView.stories.tsx
export default { title: 'Grid/GridView' }

export const Empty = () => null
export const Preview50k = () => null
export const PerformanceMode = () => null
export const WithEditsAndFilters = () => null
```

### Usage Notes
- Keep stories light and deterministic; simulate data sources via in‑memory adapters.
- Include keyboard navigation scenarios to validate a11y paths.


