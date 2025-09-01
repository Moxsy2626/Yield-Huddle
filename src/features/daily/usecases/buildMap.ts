// src/features/daily/usecases/buildMap.ts
import type { ScrapRow } from "../ports/types";

export function buildMap<K extends string>(
  rows: ScrapRow[],
  picker: (r: ScrapRow) => K
): Record<K, ScrapRow[]> {
  return rows.reduce((acc, r) => {
    const k = picker(r);
    (acc[k] ??= [] as ScrapRow[]).push(r);
    return acc;
  }, {} as Record<K, ScrapRow[]>);
}
