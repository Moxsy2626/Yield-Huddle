export type Shift = 'A' | 'B' | 'C'
export type Classification = 'Handling' | 'Workmanship' | 'Technical' | 'Training'

export interface ScrapEntry {
  id: string
  container: string
  scrapDate: string  // ISO
  code: string
  scrapReason: string
  scrapGroup?: string
  classification?: Classification
  subgroup?: string
  finding?: string
  turnoRootCause?: Shift
  estacionRootCause?: string
  personaRootCause?: string
  assessedBy?: string
}
