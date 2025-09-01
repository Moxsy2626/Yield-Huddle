import { ScrapEntry } from '../entities/scrap'
export function computeYieldLoss(entries: ScrapEntry[], confirmed: number) {
  if (confirmed <= 0) return 0
  const scrap = entries.length // stub: luego contaremos cantidades reales
  return (scrap / confirmed) * 100
}
