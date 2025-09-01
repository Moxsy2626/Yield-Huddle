// src/store/filters.ts
import { create } from "zustand";

export type Turno = "A" | "B" | "C" | "ALL";

interface FiltersState {
  date: Date;
  shift: Turno;
  setDate: (d: Date) => void;
  setShift: (t: Turno) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  date: new Date(),
  shift: "ALL",
  setDate: (d) => set({ date: d }),
  setShift: (t) => set({ shift: t }),
}));
