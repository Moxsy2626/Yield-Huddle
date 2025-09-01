// src/features/daily/usecases/aggregate.ts
import type { ScrapRow } from "../ports/types";

export function aggregateCantidad<T extends string>(
  map: Record<T, ScrapRow[]>
): Array<{ key: T; cantidad: number }> {
  return Object.entries(map).map(([key, arr]) => ({
    key: key as T,
    cantidad: arr.reduce((a, r) => a + (r.units || 0), 0),
  }));
}
