export interface ScrapEntry {
  // columnas base
  container: string;
  scrapDate: string;           // "4/1/25 11:35 AM"
  code: string;
  scrapReason: string;
  scrapGroup: string;
  classification: string;
  subgroup: string;
  finding: string;
  turnoRootCause: string;
  estacionRootCause: string;
  personaRootCause: string;
  assessedBy: string;

  // NUEVAS columnas de tu hoja
  comment?: string;
  material?: string;
  employee?: string;
  scrapTasklist?: string;
  build?: string;
  shift?: string;              // A/B/C u otro
  missingFields?: string;
  workDate?: string;           // "01/08/2025" (fecha de trabajo)

  // Campos derivados para búsquedas (guardados en DB)
  scrap_date_ts?: number;      // epoch ms
  work_date_ts?: number;       // epoch ms
}
