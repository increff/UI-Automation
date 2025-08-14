import type { PatchMap, RowId } from './models';

export function createPatchMap(): PatchMap {
  return new Map<RowId, Map<number, string>>();
}

export function applyCellPatch(map: PatchMap, rowId: RowId, colIdx: number, value: string) {
  let row = map.get(rowId);
  if (!row) {
    row = new Map<number, string>();
    map.set(rowId, row);
  }
  row.set(colIdx, value);
}

export function clearCellPatch(map: PatchMap, rowId: RowId, colIdx: number) {
  const row = map.get(rowId);
  if (!row) return;
  row.delete(colIdx);
  if (row.size === 0) map.delete(rowId);
}

export function hasEdits(map: PatchMap): boolean {
  return map.size > 0;
}


