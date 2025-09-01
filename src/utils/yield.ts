// src/utils/yield.ts
// Objetivo: centralizar el cálculo de Yield Loss para reusarlo en diaria, semanal y mensual.

export function yieldLossPct(scrap: number, confirmadas: number): number {
  const denom = confirmadas + scrap;
  if (denom <= 0) return 0;
  return (scrap / denom) * 100;
}
