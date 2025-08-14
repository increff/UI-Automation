UI Output Phase 1 — Component & State Catalogue
===============================================

References: `input/prd1.txt`, `.taskmaster/docs/improved-prd.md`, Lovable guidelines in `Lovable/`.

Screens & Layout (SPA)
----------------------
- App Shell (Top Bar, Tabs, Grid region, Right Panel, Status Bar)
- Dialogs/Overlays: Export options modal; Confirm Reset Layout; Error/Warning details panel; Keyboard help
- Toasts: Parse warnings, Export done, Errors

Component Catalogue (Responsibilities)
--------------------------------------
- `Uploader` (Top Bar button + drag‑drop area)
  - Accept multiple files; surface parse options (panel)
  - Emits files to parser worker; shows progress
- `SheetTabs`
  - One tab per file; closeable; unsaved edits badge
- `Toolbar`
  - Search box; Edit Mode toggle; Export menu; Reset Layout; Show/Hide Columns
- `GridView` (AG Grid)
  - Virtualized rows/cols; stable `rowId`; column reorder/resize/hide; sort/filter; inline edit
- `ColumnMenu`
  - Type‑aware filters; per‑column actions (sort, hide, move)
- `WarningsPanel` (Right Panel)
  - Parse options (header index, delimiter, encoding, skip empty); warnings list; file stats
- `StatusBar`
  - Rows/cols; performance mode state; memory estimate; parse progress
- `Toasts`
  - Lightweight notifications for success/warn/error

State Catalogue (What, Where, Persistence)
------------------------------------------
Global App State
- `sheets: Record<SheetId, SheetMeta>` — metadata (name, headers, storage, stats, warnings)
- `activeSheetId: SheetId`
- `performanceMode: boolean` — derived from size/rows thresholds
- `parsing: Record<SheetId, { rowsParsed: number; elapsedMs: number }>`

Per‑Sheet View State (persisted via localStorage keyed by file hash)
- `columnOrder: number[]`, `hidden: boolean[]`, `sorts: {col:number;dir:'asc'|'desc'}[]`
- `filters: Record<number, FilterClause[]>`, `density: 'compact'|'cozy'|'comfortable'`

Editing State (per sheet)
- `patchMap: Map<RowId, Map<number, string>>`
- `undoStack` / `redoStack` (bounded ≥100)

Ephemeral UI State
- `isEditing: boolean` (grid); focused cell; open menus; modals open/closed
- Export options (line endings), Reset Layout confirmation

Key Interactions (User Flows)
-----------------------------
1) Attach & Parse
- Drop/pick files → create tabs → start worker parse → META/PROGRESS/CHUNK/DONE events → preview first 50k rows quickly → incremental backfill
2) Column Reorder/Hide/Resize
- Drag headers; persist `columnOrder` and `hidden`; restore on refresh
3) Sorting & Filtering
- Click toggles sort asc/desc/none; Shift+click multi; column menu for filters; filter chips shown
4) Inline Edit & Undo/Redo
- Enter/blur commit; Esc cancel; Tab navigation; dirty indicator; undo/redo via shortcuts and toolbar
5) Search
- Quick in‑table filter across visible columns (client‑side)
6) Export
- Export Sheet (CSV) respects order/visibility and patches; Export All ZIP; choose line endings
7) Performance Mode
- Threshold check flips to IndexedDB; banner explains; adapter switches to block streaming
8) Errors & Warnings
- Toast on parse warnings; panel shows details; error surfaces non‑blocking guidance

Accessibility & Keyboard (Essentials)
-------------------------------------
- Grid: arrows, Home/End, PgUp/PgDn, Enter (edit), Esc (cancel), Tab/Shift+Tab (move)
- Focus management for menus and dialogs; aria‑sort on headers; labels on controls
- Contrast ≥ 4.5:1; visible focus rings; keyboard discoverability via help shortcut

Lovable Alignment (Microcopy & Patterns)
----------------------------------------
- Use concise, affirmative microcopy; button labels describe actions (e.g., “Export Sheet”, “Reset Layout”)
- Non‑blocking toasts; modal confirmations only for destructive actions
- Consistent spacing, typography, and iconography per `Lovable/`


