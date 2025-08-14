import type { SheetId, ViewState } from './models';
import { CSVDB } from '../db/dexie';

const KEY_PREFIX = 'csvsheet:viewstate:';

export function loadViewState(id: SheetId): ViewState | undefined {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id);
    if (!raw) return undefined;
    return JSON.parse(raw) as ViewState;
  } catch {
    return undefined;
  }
}

export function saveViewState(id: SheetId, state: ViewState): void {
  try {
    localStorage.setItem(KEY_PREFIX + id, JSON.stringify(state));
  } catch {
    // ignore quota errors silently
  }
}

export function resetViewState(id: SheetId): void {
  try {
    localStorage.removeItem(KEY_PREFIX + id);
  } catch {
    // ignore
  }
}

// IndexedDB persistence for large view-state or future expansion
export async function saveGlobalKV(key: string, value: string) {
  const db = new CSVDB();
  await db.kv.put({ key, value });
}

export async function loadGlobalKV(key: string) {
  const db = new CSVDB();
  const rec = await db.kv.get(key);
  return rec?.value;
}


