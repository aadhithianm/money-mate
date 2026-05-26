import { create } from "zustand";
import type { TransactionType } from "@/types/entities";

export interface TransactionFilters {
  workspaceId: string | null;
  accountId: string | null;
  categoryId: string | null;
  type: TransactionType | null;
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;   // YYYY-MM-DD
  search: string;
}

interface FilterState extends TransactionFilters {
  setWorkspaceId: (id: string | null) => void;
  setAccountId: (id: string | null) => void;
  setCategoryId: (id: string | null) => void;
  setType: (type: TransactionType | null) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  setSearch: (query: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: TransactionFilters = {
  workspaceId: null,
  accountId: null,
  categoryId: null,
  type: null,
  dateFrom: null,
  dateTo: null,
  search: "",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setWorkspaceId: (workspaceId) => set({ workspaceId }),
  setAccountId: (accountId) => set({ accountId }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setType: (type) => set({ type }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  setSearch: (search) => set({ search }),
  setFilters: (filters) => set(filters),
  resetFilters: () => set((state) => ({ ...initialFilters, workspaceId: state.workspaceId })),
}));
