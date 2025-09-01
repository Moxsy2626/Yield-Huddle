import type { ScrapRow } from "@/entities/scrap";

export interface DailyAggs {
  byClasificacion: { clasificacion: string; qty: number }[];
  byScrapGroup: { scrapGroup: string; qty: number }[];
  topEspecialistas: { especialista: string; clasificacion: string; qty: number }[];
  totalScrap: number;
}

export interface DailyResult {
  rows: ScrapRow[];
  aggs: DailyAggs;
}

/**
 * Mock de consulta diaria que devuelve datos fijos sin SQLite
 */
export async function queryDailyMock(): Promise<DailyResult> {
  const rows: ScrapRow[] = [
    { id: 1, supervisor: "Carlos", classification: "Handling",   station: "Estación A", scrapGroup: "Soldadura", specialist: "Juan",  units: 12 },
    { id: 2, supervisor: "Carlos", classification: "Handling",   station: "Estación A", scrapGroup: "Soldadura", specialist: "María", units: 8 },
    { id: 3, supervisor: "Carlos", classification: "Workmanship",station: "Estación B", scrapGroup: "Pintura",   specialist: "José",  units: 15 },
    { id: 4, supervisor: "Ana",    classification: "Technical",  station: "Estación C", scrapGroup: "Ensamble",  specialist: "Lucía", units: 20 },
    { id: 5, supervisor: "Ana",    classification: "Training",   station: "Estación D", scrapGroup: "Montaje",   specialist: "Pedro", units: 5 },
    { id: 6, supervisor: "Ana",    classification: "Handling",   station: "Estación D", scrapGroup: "Montaje",   specialist: "Juan",  units: 10 },
  ];

  // === Agregados básicos ===
  const byClasificacion: DailyAggs["byClasificacion"] = [];
  const byScrapGroup: DailyAggs["byScrapGroup"] = [];
  const topEspecialistas: DailyAggs["topEspecialistas"] = [];
  let totalScrap = 0;

  // sumatorias por clasificación y grupo
  const mClas = new Map<string, number>();
  const mGroup = new Map<string, number>();
  const mEsp = new Map<string, { clasificacion: string; qty: number }>();

  for (const r of rows) {
    totalScrap += r.units;
    const clas = r.classification ?? "Not defined";
    const group = r.scrapGroup ?? "Not defined";

    mClas.set(clas, (mClas.get(clas) ?? 0) + r.units);
    mGroup.set(group, (mGroup.get(group) ?? 0) + r.units);

    const prev = mEsp.get(r.specialist ?? "N/D") ?? { clasificacion: clas, qty: 0 };
    mEsp.set(r.specialist ?? "N/D", { clasificacion: clas, qty: prev.qty + r.units });
  }

  for (const [c, q] of mClas) byClasificacion.push({ clasificacion: c, qty: q });
  for (const [g, q] of mGroup) byScrapGroup.push({ scrapGroup: g, qty: q });
  for (const [e, v] of mEsp) topEspecialistas.push({ especialista: e, clasificacion: v.clasificacion, qty: v.qty });

  return {
    rows,
    aggs: { byClasificacion, byScrapGroup, topEspecialistas, totalScrap },
  };
}
