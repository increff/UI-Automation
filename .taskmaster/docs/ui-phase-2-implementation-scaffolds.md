UI Output Phase 2 — Implementation Scaffolds (React + TS + Vite)
================================================================

References: `.taskmaster/docs/improved-prd.md`, `input/prd1.txt`, Lovable guidelines in `Lovable/`.

Suggested Folder Structure (from PRD §14)
-----------------------------------------
```
src/
  app/
    store.ts                
    routes.tsx              
  components/
    Uploader.tsx
    SheetTabs.tsx
    Toolbar.tsx
    GridView.tsx
    ColumnMenu.tsx
    StatusBar.tsx
    WarningsPanel.tsx
  data/
    adapters/
      MemoryAdapter.ts
      DexieAdapter.ts
    models.ts               
    viewState.ts            
  workers/
    parser.worker.ts        
  utils/
    fileHash.ts
    csvExport.ts
    detectDelimiter.ts
    perf.ts
  db/
    dexie.ts                
```

Core Types (`data/models.ts`)
-----------------------------
```ts
export type SheetId = string;
export type RowId = number;
export type Cell = string;

export interface SheetMeta {
  id: SheetId;
  name: string;
  headers: string[];
  columnOrder: number[];
  hidden: boolean[];
  stats: { rows: number; cols: number };
  warnings: string[];
  storage: 'memory' | 'indexeddb';
}

export interface ViewState {
  sorts: Array<{ col: number; dir: 'asc' | 'desc' }>;
  filters: Record<number, any[]>; // FilterClause[]
  density: 'compact' | 'cozy' | 'comfortable';
}

export type PatchMap = Map<RowId, Map<number, Cell>>;
```

Data Adapter Interface (`data/adapters/*`)
------------------------------------------
```ts
export interface IDataAdapter {
  getRowCount(): Promise<number>;
  getRows(range: { offset: number; limit: number }): Promise<{ rowId: RowId; cells: Cell[] }[]>;
  scan(predicate?: (row: string[]) => boolean): AsyncGenerator<{ rowId: RowId; row: string[] }>;
}
```

Store Skeleton (`app/store.ts`)
-------------------------------
```ts
import { create } from 'zustand';

interface AppState {
  sheets: Record<string, any>;
  activeSheetId?: string;
  setActive: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sheets: {},
  activeSheetId: undefined,
  setActive: (id) => set({ activeSheetId: id }),
}));
```

Parser Worker Skeleton (`workers/parser.worker.ts`)
--------------------------------------------------
```ts
// See Appendix A in PRD. Post META/CHUNK/PROGRESS/DONE/ERROR messages.
```

Dexie Schema (`db/dexie.ts`)
----------------------------
```ts
// See Appendix B in PRD for tables: sheets, blocks [sheetId+blockIndex]
```

Grid Integration Notes (`components/GridView.tsx`)
--------------------------------------------------
```ts
// AG Grid with stable getRowId(row) => row.rowId
// Column defs derived from headers + columnOrder
// Persist moves via columnApi and viewState
```

Export Utility (`utils/csvExport.ts`)
-------------------------------------
```ts
// Stream CSV chunks from adapter + patches; respect order/visibility; avoid large concatenations
```

View State Utility (`data/viewState.ts`)
----------------------------------------
```ts
// Load/save per SheetId to localStorage; stable key from file hash
```

Lovable Conventions Checklist
-----------------------------
- Component props named by purpose; avoid abbreviations
- Clear empty/edge states; non‑blocking toasts for feedback
- Accessible labels and keyboard patterns as per `.taskmaster/docs/improved-prd.md`


