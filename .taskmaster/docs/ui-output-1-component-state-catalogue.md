## UI Output 1: Component & State Catalogue

References: `./prd-improved.md`, `Lovable/`, `@knowledge-coding-guidelines.mdc`.

### Screens/Surfaces
- App Shell
  - Top Bar: Upload button, drag‑drop hint, Search, Edit Mode toggle, Export (Sheet/All), Reset Layout.
  - Tabs: one per file (closable, unsaved edits badge). Left/top placement per `Lovable` patterns.
  - Main: Grid view (AG Grid), Right Panel (Parse options, Warnings, File stats), Bottom Status Bar.

### Components
- Uploader
  - States: idle (dropzone), dragging, parsing (progress), error.
  - Events: filesSelected(FileList), parseCancelled, parseCompleted.

- SheetTabs
  - States: none/one/many tabs, active tab, close confirm when dirty.
  - Badges: dirty (unsaved edits), perf mode.

- Toolbar
  - Controls: Search input, Edit toggle, Export menu, Reset layout.
  - States: editOn/off; export menu open/closed; search active.

- GridView (AG Grid)
  - States: empty, preview (first 50k), loading more, performance mode, error.
  - Interactions: column drag reorder/resize/hide, sort, filter, inline edit, keyboard nav.
  - Dirty cell styling; focus ring; aria attrs.

- ColumnMenu
  - Modes: text filter (contains/equals/starts‑with + case), numeric filter (=, ≠, >, ≥, <, ≤, between).
  - Actions: sort asc/desc, hide/show column.

- WarningsPanel
  - Lists parse warnings with message and optional snippet; filter by type.

- StatusBar
  - Fields: rows, cols, perf mode indicator, memory estimate, warnings count, progress.

- ExportMenu
  - Actions: Export Sheet (CSV), Export All (ZIP), line endings (\n/\r\n).

### App State (TypeScript)
- SheetMeta: id, name, headers, columnOrder, hidden[], stats{rows,cols}, warnings[], storage.
- ViewState: sorts[], filters by col, density, searchQuery.
- PatchMap: rowId -> (colIdx -> value). Undo/Redo stacks per sheet.
- Parsing: progress per sheet, detected delimiter/encoding, errors.
- Perf flags: isPerformanceMode per sheet.

### Key Interactions
- Attach files → create tabs → kick worker parse → show progressive preview.
- Reorder columns → persist immediately to localStorage keyed by file hash.
- Apply filters/sorts → update grid model; in Performance Mode prefer incremental scans.
- Edit cells → update PatchMap + push to undo stack; dirty indicator shown.
- Export → stream CSV or ZIP; respect column order/visibility and edits.

### Accessibility
- Keyboard: arrows, Home/End, PageUp/Down, Enter, Esc, Tab/Shift+Tab.
- aria-sort on headers, labels on menus, visible focus outlines, contrast ≥ 4.5:1.


