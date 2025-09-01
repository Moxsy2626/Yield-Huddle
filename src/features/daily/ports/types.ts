// src/features/daily/ports/types.ts
export type UnitDetail = {
  id: string;
  timestamp?: string;
  comment?: string;
  station?: string;
  specialist?: string;
};

export type ScrapRow = {
  id: string | number;
  scrapGroup?: string;
  classification?: string;
  supervisor?: string;
  specialist?: string;
  station?: string;
  units: number;
  date?: string;
  shift?: "A" | "B" | "C";
  unitDetails?: UnitDetail[];
};

export type DailyResult = {
  rows: ScrapRow[];
};
