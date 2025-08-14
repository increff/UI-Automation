import JSZip from 'jszip';
import { exportSheetCSV } from './csvExport';
import type { IDataAdapter, PatchMap } from '../data/models';

export async function exportAllZip(
  sheets: Array<{
    name: string;
    adapter: IDataAdapter;
    columnOrder: number[];
    hidden: boolean[];
    patches: PatchMap;
    lineEnding: '\n' | '\r\n';
    hasEdits: boolean;
  }>
): Promise<Blob> {
  const zip = new JSZip();
  for (const s of sheets) {
    const blob = await exportSheetCSV(s.adapter, {
      columnOrder: s.columnOrder,
      hidden: s.hidden,
      lineEnding: s.lineEnding,
      patches: s.patches,
    });
    const filename = s.hasEdits ? `${s.name}-edited.csv` : `${s.name}.csv`;
    zip.file(filename, blob);
  }
  return zip.generateAsync({ type: 'blob' });
}


