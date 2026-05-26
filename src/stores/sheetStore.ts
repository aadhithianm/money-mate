import { create } from "zustand";

export type SheetType = "expense" | "income" | "transfer" | null;

interface SheetState {
  activeSheet: SheetType;
  payload: any; // Used to pass initialization data, e.g. for editing transactions
  openSheet: (sheet: SheetType, payload?: any) => void;
  closeSheet: () => void;
}

export const useSheetStore = create<SheetState>((set) => ({
  activeSheet: null,
  payload: null,
  openSheet: (sheet, payload = null) => set({ activeSheet: sheet, payload }),
  closeSheet: () => set({ activeSheet: null, payload: null }),
}));
