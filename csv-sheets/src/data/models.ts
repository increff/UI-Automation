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
  // FilterClause kept generic initially; refine when filters are implemented
  filters: Record<number, any[]>;
  density: 'compact' | 'cozy' | 'comfortable';
}

export type PatchMap = Map<RowId, Map<number, Cell>>;

export interface IDataAdapter {
  getRowCount(): Promise<number>;
  getRows(range: { offset: number; limit: number }): Promise<{ rowId: RowId; cells: Cell[] }[]>;
  scan(predicate?: (row: string[]) => boolean): AsyncGenerator<{ rowId: RowId; row: string[] }>;
}


