Improved PRD: Multi‑CSV Sheet Viewer & Inline Editor (Client‑Side Only)
==============================================================================

Source: `input/prd1.txt` (v1.0, 2025‑08‑13)
Scope Owner: Shubham Omar
Traceability: All requirements map back to sections and AC in the source PRD.

Executive Summary
-----------------
A single‑page React app lets users attach multiple CSVs, each shown as a sheet tab. Parsing is 100% local (Web Worker), with a virtualized, editable grid supporting column reordering, sorting, filtering, and large‑file safeguards. Edits are tracked as non‑destructive patches and exports are available per sheet or as a ZIP of all. Design follows Lovable guidelines located under `Lovable/`.

Scope Boundaries
----------------
- In scope (v1): Multi‑file upload; streaming parse in worker; virtualization; inline edit; column reorder/hide; sort/filter; search; warnings; local persistence (layout and view state); export CSV/ZIP; IndexedDB “Performance Mode” for very large files; keyboard/a11y basics.
- Out of scope (v1): Server APIs/cloud persistence; cross‑sheet joins; formula engine; collaborative editing/multi‑user presence; frozen columns and type inference (v1.1 behind flag); row add/delete; domain‑specific validation rules; merge sheets; computed columns; cloud save.

Normalized Requirements (with Acceptance)
----------------------------------------
F1. File Attach & Tabs (PRD §4.1)
- Multiple files via drag‑drop and picker; each file becomes a tab named after the file (sans extension).
- Parse options per file: header row index (default 1); delimiter auto‑detect + manual override; encoding auto‑detect + manual override; skip empty lines (default on).
- Show parse progress and warnings summary.
– Acceptance: AC1 (multi‑file preview speed), AC6 (robust parsing incl. empty/ragged), AC9 (no network).

F2. Grid & Virtualization (PRD §4.2)
- Headers are displayed exactly as in the file (duplicates allowed; internal dedupe for addressing only).
- Row virtualization always; column virtualization when >200 columns.
- Inline editing: enter/blur to commit; Esc to cancel; Tab/Shift+Tab navigation; dirty cell indicator.
- Column ops: drag reorder, resize, hide/show; sorting with single/multi (Shift).
– Acceptance: AC2 (headers), AC3 (reorder persists), AC4 (sorting/filtering basics), AC5 (inline edit reflection).

F3. Filtering & Search (PRD §4.2)
- Text: contains/equals/starts‑with (case toggle). Numeric: =, ≠, >, ≥, <, ≤, between. Search box filters across visible columns.
– Acceptance: AC4.

F4. Large Files & Storage (PRD §4.3)
- Parsing in Web Worker with streaming/chunked mode; progressive preview (first 50k rows ASAP).
- Auto‑switch to IndexedDB (Dexie) when file size >200MB or rows >2,000,000. Maintain stable rowId across operations.
– Acceptance: AC7 (performance & responsiveness), AC6 (stability), AC9 (local‑only processing).

F5. Data Integrity & Edge Cases (PRD §4.4)
- Empty lines ignored on parse; ragged rows padded; extra trailing fields → warning. Quotes/embedded newlines supported; duplicate headers allowed (display unchanged).
– Acceptance: AC2 (headers), AC6 (robustness).

F6. Editing & Undo/Redo (PRD §4.5)
- Per‑sheet patch map `{ rowId -> { colIdx -> newValue } }`; undo/redo stacks (≥100 steps). Original data remains immutable until export.
– Acceptance: AC5 (edits + undo/redo), AC8 (export reflects edits).

F7. Export (PRD §4.6)
- Export Sheet: CSV honoring current order/visibility with edits applied. Export All: ZIP of edited sheets (fileName‑edited.csv), untouched keep original name. Line endings selectable (\n default, \r\n optional).
– Acceptance: AC8.

F8. Persistence (PRD §4.7)
- Persist per‑sheet column order, visibility, sorts, filters, grid density in `localStorage` keyed by stable file hash (name+size+lastModified). Provide Reset Layout.
– Acceptance: AC3 (reorder persists).

F9. Accessibility & Keyboard (PRD §4.8, §9)
- Keyboard‑navigable grid (arrows, Home/End, PgUp/PgDn), Enter to edit, Esc to cancel, Tab to move. Visible focus rings, aria labels, contrast compliance.
– Acceptance: AC10.

Non‑Functional Requirements (PRD §5)
- Performance: 50k rows visible <3s; 60fps scrolling typical; sort/filter 1M rows <2s in Performance Mode.
- Memory: JS heap under ~1.5GB for 1M×50 via IndexedDB blocks; avoid large full copies.
- Security/Privacy: 100% local; “Clear all data” wipes IndexedDB + localStorage.
- Browser Support: Latest Chrome/Edge/Safari; graceful unsupported notice.
– Acceptance: AC7, AC9.

Architecture & Tech (PRD §6)
- React 18 + TypeScript; Vite; AG Grid Community for grid; Papa Parse (worker) for CSV streaming; Dexie for IndexedDB; JSZip for ZIP; optional DuckDB‑WASM (flagged) for large multi‑ops.

Acceptance Criteria (Condensed from PRD §10)
1) Upload 3 CSVs → 3 tabs; first 50k rows preview within ~3s. 2) Headers exactly match file; duplicates display. 3) Column reorder persists after refresh. 4) Sort + filter (string/numeric) incl. Shift‑multi sort. 5) Inline edits show dirty; Undo/Redo; export applies edits. 6) Empty/ragged rows parse w/out crash; warnings visible. 7) 1M×50 stays responsive; IndexedDB auto‑mode. 8) Export Sheet honors order/visibility; Export All ZIP. 9) No network requests during parse/edit/export. 10) Keyboard nav + basic a11y.

Traceability Matrix (Feature → AC)
- F1 → 1,6,9
- F2 → 2,3,4,5
- F3 → 4
- F4 → 7,6,9
- F5 → 2,6
- F6 → 5,8
- F7 → 8
- F8 → 3
- F9 → 10

Open Questions & Assumptions
- From PRD §16: (1) Max file size/row count targets beyond provided thresholds? (2) Frozen columns in v1 (currently v1.1)? (3) Allow row add/delete (currently out)? (4) Any domain‑specific validation rules?
- Additional assumptions for v1: (a) Single‑window SPA; (b) No i18n beyond English; (c) Light/dark theming optional; (d) Storage purge via in‑app control only.

Design Alignment
- Follow Lovable guidelines under `Lovable/` for tone, layout patterns, microcopy, and component conventions. Where conflicts arise, PRD acceptance criteria take precedence.


