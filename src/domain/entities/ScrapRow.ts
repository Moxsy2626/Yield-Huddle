// src/domain/entities/ScrapRow.ts
export interface ScrapRow {
  id: string | number;
  scrapGroup?: string;
  classification?: string;
  supervisor?: string;
  specialist?: string;
  station?: string;
  units: number;
  date?: string;
  shift?: "A" | "B" | "C";
}
