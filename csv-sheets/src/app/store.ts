import { create } from 'zustand';
import type { SheetId, SheetMeta } from '../data/models';

interface AppState {
  sheets: Record<SheetId, SheetMeta>;
  activeSheetId?: SheetId;
  setActive: (id: SheetId) => void;
  setSheetMeta: (meta: SheetMeta) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sheets: {},
  activeSheetId: undefined,
  setActive: (id) => set({ activeSheetId: id }),
  setSheetMeta: (meta) => set((state) => ({
    sheets: { ...state.sheets, [meta.id]: meta },
  })),
}));


