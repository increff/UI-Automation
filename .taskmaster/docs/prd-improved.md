# Improved PRD: Multi‑CSV Sheet Viewer & Inline Editor (Client‑Side Only)

Source: `input/prd1.txt` v1.0 (2025‑08‑13). This document compresses and normalises the PRD for lower token usage while preserving acceptance criteria and traceability.

## 1) Executive Summary

- Build a client‑side SPA to open multiple CSV files as sheet tabs, parse entirely in the browser, and render an Excel‑like, virtualized, editable grid.
- Headers must match the file exactly; duplicates allowed (internal keys deduped silently).
- Provide column reordering/resizing/hide, multi‑sort, text/numeric filtering, search, inline edits with Undo/Redo, and layout persistence per file hash.
- Handle large datasets via worker‑based streaming parse and IndexedDB storage with an LRU cache; keep UI responsive.
- Export edited data as CSV per sheet or all sheets as a ZIP, honoring current column order/visibility and applying edits.
- A11y and keyboard navigation required. No network calls; all processing remains local.

## 2) Scope Boundaries (v1)

- In: Multi‑file attach (drag‑drop / picker), worker‑based streaming parsing, virtualized grid, inline editing, sorting/filtering, column drag, IndexedDB for large files, export CSV/ZIP, warnings, a11y + keyboard, local persistence.
- Out (v1): Server APIs/cloud save, cross‑sheet joins, formula engine, collaborative editing.
- Stretch (v1.1): Type inference for better filter UIs, frozen columns, multi‑cell paste, DuckDB‑WASM for heavy ops.

## 3) Normalised Requirements

### 3.1 File Attach & Tabs
- Accept multiple CSVs via drag‑drop and picker; one tab per file (tab name = file name sans ext).
- Per‑file parse options (side panel): header row index (default 1), delimiter auto‑detect + override, encoding auto‑detect (UTF‑8/BOM) + override, skip empty lines (default on).
- Show parse progress (rows read, elapsed ms) and warnings summary.

### 3.2 Grid (Table)
- Headers displayed exactly as in file; internal keys may dedupe (e.g., name, name2). Display text unchanged.
- Virtualization: rows always; columns if > 200.
- Inline editing: Enter/blur to commit; Esc cancel; Tab/Shift+Tab navigation; dirty indicator per cell; Undo/Redo (≥100 steps) per sheet.
- Column ops: drag reorder, resize, hide/show; sort asc/desc; multi‑sort with Shift.
- Filtering: text (contains/equals/starts‑with with case toggle), numeric (=, ≠, >, ≥, <, ≤, between).
- Search box filters across visible columns.
- Status bar: rows/cols, performance mode, memory estimate, warnings count.

### 3.3 Large Files & Storage
- Parser runs in Web Worker with streaming/chunked mode; progressive preview: first 50k rows ASAP then backfill.
- Auto‑switch to IndexedDB (Dexie) if file size > 200MB or rows > 2,000,000.
- Maintain stable `rowId` for sorting/filtering and patch overlay.

### 3.4 Data Integrity & Edge Cases
- Empty lines ignored on parse; retain original row numbering via `rowId`.
- Ragged rows: pad trailing fields with empty strings; extra fields beyond header count → warning.
- Quotes/embedded newlines supported; unterminated quotes → warning with snippet.
- Duplicate headers allowed; UI shows original labels; internal addressing deduped.

### 3.5 Export
- Export Sheet: CSV honoring current column order/visibility and applied edits.
- Export All: ZIP of `fileName-edited.csv` per sheet with edits; untouched sheets keep original name.
- Line endings normalized to `\n` unless user picks `\r\n`.

### 3.6 Persistence
- Persist per‑sheet column order, visibility, sorts, filters, and grid density in `localStorage` keyed by stable file hash (name + size + lastModified). Provide Reset Layout.

### 3.7 Accessibility & Keyboard
- Grid usable via keyboard (arrows, Home/End, PageUp/Down, Enter to edit, Esc cancel, Tab to move). Menus navigable with labeled controls; visible focus ring; contrast compliant.

### 3.8 Non‑Functional
- Performance: First 50k rows visible < 3s on 8‑core laptop; 60fps scrolling on typical sets; sort/filter on 1M rows < 2s in Performance Mode.
- Memory: Keep JS heap < ~1.5GB on 1M×50 by using IndexedDB and avoiding full copies.
- Privacy: 100% local; no network calls. Provide "Clear all data" to wipe IndexedDB + localStorage.
- Browser: Latest Chrome, Edge, Safari; show graceful warning otherwise.

## 4) Acceptance Criteria (v1)

1. Upload 3 CSVs → 3 tabs; preview first 50k rows < 3s.  
2. Headers exactly match file; duplicates display as‑is; internal keys deduped.  
3. Column reorder persists per file across refresh.  
4. Sorting and text/numeric filtering work; Shift multi‑sort works.  
5. Inline edits marked dirty; Undo/Redo works; export applies edits.  
6. Empty lines and ragged rows parse without crash; warnings visible.  
7. 1M×50 keeps UI responsive; IndexedDB mode used automatically.  
8. Export Sheet respects column order/visibility; Export All creates ZIP.  
9. No network requests during parse/edit/export.  
10. Keyboard navigation and basic a11y validated.

## 5) Open Questions & Assumptions

Open Questions (from PRD §16):
- Max file size/row targets beyond provided thresholds?  
- Frozen columns in v1 (currently v1.1)?  
- Row add/delete in v1 (currently out of scope)?  
- Domain‑specific validation rules (unique keys, required columns)?

Assumptions:
- AG Grid Community, Papa Parse (worker mode), Dexie, JSZip; optional DuckDB‑WASM behind a flag.
- Local‑only processing; no telemetry leaves the device.
- File hash = `name + size + lastModified` is sufficiently stable for local persistence keys.

## 6) Traceability

- Summaries normalised from PRD sections: Goals (§1), Scope (§3), Functional Req (§4), Non‑Functional (§5), UI/UX (§7), Acceptance Criteria (§10).  
- Tech references per PRD Architecture (§6).  
- Risks and mitigations per PRD (§12).  

## 7) References

- Design patterns: see `Lovable/` guidelines.  
- Coding standards: see `@knowledge-coding-guidelines.mdc`.  
- Full PRD source: `input/prd1.txt`.


