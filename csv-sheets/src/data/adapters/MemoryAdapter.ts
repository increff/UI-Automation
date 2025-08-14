import type { Cell, IDataAdapter, RowId } from '../models';

export class MemoryAdapter implements IDataAdapter {
  private rows: string[][] = [];

  constructor(initial?: string[][]) {
    if (initial?.length) this.rows = initial.slice();
  }

  appendRows(rows: string[][]) {
    if (rows.length === 0) return;
    for (const r of rows) this.rows.push(r);
  }

  async getRowCount(): Promise<number> {
    return this.rows.length;
  }

  async getRows(range: { offset: number; limit: number }): Promise<{ rowId: RowId; cells: Cell[] }[]> {
    const out: { rowId: number; cells: string[] }[] = [];
    const end = Math.min(this.rows.length, range.offset + range.limit);
    for (let i = range.offset; i < end; i++) {
      out.push({ rowId: i, cells: this.rows[i]! });
    }
    return out;
  }

  async *scan(predicate?: (row: string[]) => boolean) {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i]!;
      if (!predicate || predicate(row)) {
        yield { rowId: i, row };
      }
    }
  }
}


