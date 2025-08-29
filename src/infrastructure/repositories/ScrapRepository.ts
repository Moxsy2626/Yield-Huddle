import { ScrapEntry } from '../../entities/scrap'
export interface ScrapRepository {
  listByDate(dateISO: string): Promise<ScrapEntry[]>
  insertMany(rows: ScrapEntry[]): Promise<void>
  listUnclassified(dateISO: string): Promise<ScrapEntry[]>
}
