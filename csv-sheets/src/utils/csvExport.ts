import type { IDataAdapter, PatchMap } from '../data/models';

export async function exportSheetCSV(
  adapter: IDataAdapter,
  options: {
    columnOrder: number[];
    hidden: boolean[];
    lineEnding: '\n' | '\r\n';
    patches: PatchMap;
  }
): Promise<Blob> {
  const total = await adapter.getRowCount();
  const chunks: string[] = [];
  const newline = options.lineEnding;
  const visibleColumns = options.columnOrder.filter((idx) => !options.hidden[idx]);

  for (let offset = 0; offset < total; offset += 2000) {
    const rows = await adapter.getRows({ offset, limit: 2000 });
    for (const { rowId, cells } of rows) {
      const patched = cells.slice();
      const rowPatch = options.patches.get(rowId);
      if (rowPatch) {
        for (const [colIdx, value] of rowPatch.entries()) {
          patched[colIdx] = value;
        }
      }
      const ordered = visibleColumns.map((idx) => patched[idx] ?? '');
      const escaped = ordered.map((v) => maybeQuote(v));
      chunks.push(escaped.join(',') + newline);
    }
  }
  return new Blob(chunks, { type: 'text/csv;charset=utf-8' });
}

function maybeQuote(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}


