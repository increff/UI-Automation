import type { Cell, IDataAdapter, RowId } from '../models';
import { CSVDB } from '../../db/dexie';

const DEFAULT_BLOCK_SIZE = 5000; // rows per block

export class DexieAdapter implements IDataAdapter {
  private db = new CSVDB();
  private blockSize: number;
  private sheetId: string;
  private nextBlockIndex = 0;
  private initialized = false;

  constructor(params: { sheetId: string; blockSize?: number }) {
    this.sheetId = params.sheetId;
    this.blockSize = params.blockSize ?? DEFAULT_BLOCK_SIZE;
  }

  async initIfNeeded(headers?: string[]) {
    if (this.initialized) return;
    const existing = await this.db.sheets.get(this.sheetId);
    if (!existing) {
      await this.db.sheets.put({
        id: this.sheetId,
        name: this.sheetId,
        headers: headers ?? [],
        rowCount: 0,
        colCount: headers?.length ?? 0,
        createdAt: Date.now(),
      });
      this.nextBlockIndex = 0;
    } else {
      // recover next block index by counting existing blocks
      const blocks = await this.db.blocks.where('[sheetId+blockIndex]').between([this.sheetId, 0], [this.sheetId, Number.MAX_SAFE_INTEGER]).toArray();
      this.nextBlockIndex = blocks.length;
    }
    this.initialized = true;
  }

  async setHeaders(headers: string[]) {
    await this.initIfNeeded(headers);
    await this.db.sheets.update(this.sheetId, { headers, colCount: headers.length });
  }

  async appendRows(rows: string[][]) {
    await this.initIfNeeded();
    if (!rows.length) return;
    // Write rows in blocks
    let idx = 0;
    while (idx < rows.length) {
      const end = Math.min(idx + this.blockSize, rows.length);
      const slice = rows.slice(idx, end);
      await this.db.blocks.put({ sheetId: this.sheetId, blockIndex: this.nextBlockIndex++, rows: slice });
      idx = end;
    }
    // update rowCount
    const rec = await this.db.sheets.get(this.sheetId);
    const newCount = (rec?.rowCount ?? 0) + rows.length;
    await this.db.sheets.update(this.sheetId, { rowCount: newCount });
  }

  async getRowCount(): Promise<number> {
    const rec = await this.db.sheets.get(this.sheetId);
    return rec?.rowCount ?? 0;
  }

  async getRows(range: { offset: number; limit: number }): Promise<{ rowId: RowId; cells: Cell[] }[]> {
    await this.initIfNeeded();
    if (range.limit <= 0) return [];
    // Simple implementation: read blocks sequentially and slice
    const blocks = await this.db.blocks
      .where('[sheetId+blockIndex]')
      .between([this.sheetId, 0], [this.sheetId, Number.MAX_SAFE_INTEGER])
      .toArray();
    const out: { rowId: number; cells: string[] }[] = [];
    let cursor = 0;
    const start = range.offset;
    const end = range.offset + range.limit;
    for (const b of blocks) {
      const next = cursor + b.rows.length;
      if (next <= start) {
        cursor = next;
        continue;
      }
      // overlap
      const localStart = Math.max(0, start - cursor);
      const localEnd = Math.min(b.rows.length, end - cursor);
      for (let i = localStart; i < localEnd; i++) {
        out.push({ rowId: cursor + i, cells: b.rows[i]! });
      }
      cursor = next;
      if (cursor >= end) break;
    }
    return out;
  }

  async *scan(predicate?: (row: string[]) => boolean) {
    await this.initIfNeeded();
    const blocks = await this.db.blocks
      .where('[sheetId+blockIndex]')
      .between([this.sheetId, 0], [this.sheetId, Number.MAX_SAFE_INTEGER])
      .toArray();
    let rowId = 0;
    for (const b of blocks) {
      for (const row of b.rows) {
        if (!predicate || predicate(row)) {
          yield { rowId, row };
        }
        rowId++;
      }
    }
  }
}


