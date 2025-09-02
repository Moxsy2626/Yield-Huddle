import { ScrapEntry } from '../../../entities/scrap'
import { ScrapRepository } from '../ScrapRepository'

const rows: ScrapEntry[] = []

export class ScrapMemoryRepo implements ScrapRepository {
  async listByDate(dateISO: string): Promise<ScrapEntry[]> {
    return rows.filter(r => r.scrapDate.slice(0,10) === dateISO.slice(0,10))
  }
  async insertMany(data: ScrapEntry[]): Promise<void> {
    rows.push(...data)
  }
  async listUnclassified(dateISO: string): Promise<ScrapEntry[]> {
    return rows.filter(r =>
      r.scrapDate.slice(0,10) === dateISO.slice(0,10) &&
      (!r.turnoRootCause || !r.scrapGroup || !r.personaRootCause || !r.estacionRootCause ||
       r.scrapGroup?.toLowerCase().includes('not defined'))
    )
  }
}
