// src/features/daily/usecases/computeYield.ts

export function computeYieldBy<T extends string>(
  aggs: Array<{ key: T; cantidad: number }>,
  base: number
) {
  return aggs.map(a => ({
    key: a.key,
    cantidad: a.cantidad,
    yieldPct: base > 0 ? (a.cantidad / base) * 100 : 0
  }));
}
