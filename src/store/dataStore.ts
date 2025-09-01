import { create } from "zustand";
import type { ScrapRow } from "@/domain/entities/ScrapRow";

interface DataState {
  rows: ScrapRow[];
  setRows: (rows: ScrapRow[]) => void;
  appendRows: (rows: ScrapRow[]) => void;
  clearRows: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  rows: [],
  setRows: (rows) => set({ rows }),
  appendRows: (rows) => set((s) => ({ rows: [...s.rows, ...rows] })),
  clearRows: () => set({ rows: [] }),
}));
