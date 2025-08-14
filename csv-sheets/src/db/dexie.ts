import Dexie, { type Table } from 'dexie';

export interface SheetRowBlock { sheetId: string; blockIndex: number; rows: string[][] }
export interface SheetRec { id: string; name: string; headers: string[]; rowCount: number; colCount: number; createdAt: number }
export interface KV { key: string; value: string }

export class CSVDB extends Dexie {
  sheets!: Table<SheetRec, string>;
  blocks!: Table<SheetRowBlock, [string, number]>;
  kv!: Table<KV, string>;
  constructor() {
    super('csv-sheets');
    this.version(1).stores({
      sheets: 'id',
      blocks: '[sheetId+blockIndex]'
    });
    this.version(2).stores({ kv: 'key' });
  }
}


