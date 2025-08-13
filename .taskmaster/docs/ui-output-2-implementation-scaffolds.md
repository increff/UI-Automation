## UI Output 2: Implementation Scaffolds (React + TypeScript)

References: `./prd-improved.md`, coding standards in `@knowledge-coding-guidelines.mdc`.

### Folder Structure (proposed)

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

### Key Interfaces (TypeScript)

```ts
export type SheetId = string
export type RowId = number
export type Cell = string

export interface SheetMeta {
  id: SheetId
  name: string
  headers: string[]
  columnOrder: number[]
  hidden: boolean[]
  stats: { rows: number; cols: number }
  warnings: string[]
  storage: 'memory' | 'indexeddb'
}

export type PatchMap = Map<RowId, Map<number, Cell>>

export interface ViewState {
  sorts: Array<{ col: number; dir: 'asc' | 'desc' }>
  filters: Record<number, unknown[]> // placeholder for FilterClause
  density: 'compact' | 'cozy' | 'comfortable'
  searchQuery?: string
}

export interface IDataAdapter {
  getRowCount(): Promise<number>
  getRows(range: { offset: number; limit: number }): Promise<{ rowId: RowId; cells: Cell[] }[]>
  scan(predicate?: (row: string[]) => boolean): AsyncGenerator<{ rowId: RowId; row: string[] }>
}
```

### Component Skeletons

```tsx
// components/Uploader.tsx
export function Uploader() {
  return null
}

// components/SheetTabs.tsx
export function SheetTabs() {
  return null
}

// components/Toolbar.tsx
export function Toolbar() {
  return null
}

// components/GridView.tsx
export function GridView() {
  return null
}

// components/ColumnMenu.tsx
export function ColumnMenu() {
  return null
}

// components/StatusBar.tsx
export function StatusBar() {
  return null
}

// components/WarningsPanel.tsx
export function WarningsPanel() {
  return null
}
```

### Worker Protocol (message shapes)

```ts
type UIToWorker =
  | { type: 'PARSESTART'; sheetId: string; file: File; options: { headerRowIndex: number; delimiter?: string; encoding?: string; skipEmptyLines: boolean } }
  | { type: 'CANCEL'; sheetId: string }

type WorkerToUI =
  | { type: 'META'; sheetId: string; headers: string[]; detected: { delimiter?: string; encoding?: string } }
  | { type: 'CHUNK'; sheetId: string; rows: string[][]; startRowId: number }
  | { type: 'PROGRESS'; sheetId: string; rowsParsed: number; elapsedMs: number }
  | { type: 'WARNING'; sheetId: string; message: string; sample?: string }
  | { type: 'DONE'; sheetId: string; totalRows: number }
  | { type: 'ERROR'; sheetId: string; error: string }
```

### Performance Flags
- PERFBLOCKSIZE=5000, CACHEBLOCKS=30
- LARGEFILEROWTHRESHOLD=2_000_000, LARGEFILESIZEMB=200


