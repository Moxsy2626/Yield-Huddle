
import type { ScrapRow } from "@/entities/scrap";

export interface DailyAggs {
  byClasificacion: { clasificacion: string; qty: number }[];
  byScrapGroup: { scrapGroup: string; qty: number }[];
  topEspecialistas: { especialista: string; clasificacion: string; qty: number }[];
=======
// src/data/queries/queryDaily.ts
import type { SQLDatabase, SQLStatement } from "../sqlite";

export type Turno = "A" | "B" | "C" | "ALL";
export type Clasificacion =
  | "Handling"
  | "Workmanship"
  | "Technical"
  | "Training"
  | "Not defined"
  | string;

export interface DailyFilters {
  date: Date;
  shift?: Turno | "ALL";
}

export interface RowFlat {
  supervisor: string;
  clasificacion: Clasificacion;
  estacion: string;
  scrapGroup: string;
  hallazgo: string;
  especialista: string;
  qty: number;
}

export interface HierNode {
  key: string;
  label: string;
  qty?: number;
  children?: HierNode[];
}

export interface DailyAggs {
  byClasificacion: { clasificacion: Clasificacion; qty: number }[];
  byScrapGroup: { scrapGroup: string; qty: number }[];
  topEspecialistas: { especialista: string; qty: number; clasificacion: Clasificacion }[];
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
=======
  hierarchy: HierNode[];
  aggs: DailyAggs;
}

// Helpers fecha
function startOfDayMs(d: Date): number { const x = new Date(d); x.setHours(0,0,0,0); return x.getTime(); }
function endOfDayMs(d: Date): number   { const x = new Date(d); x.setHours(23,59,59,999); return x.getTime(); }

// Jerarquía
function buildHierarchy(rows: RowFlat[]): HierNode[] {
  const supervisors = new Map<string, HierNode>();
  const getOrPush = (arr: HierNode[], key: string, label: string): HierNode => {
    const f = arr.find((n) => n.key === key); if (f) return f;
    const node: HierNode = { key, label, children: [] }; arr.push(node); return node;
  };

  for (const r of rows) {
    const supKey = `sup:${r.supervisor || "Sin supervisor"}`;
    if (!supervisors.has(supKey)) supervisors.set(supKey, { key: supKey, label: r.supervisor || "Sin supervisor", children: [] });
    const supNode = supervisors.get(supKey)!;

    const cNode  = getOrPush(supNode.children!, `${supKey}|c:${r.clasificacion}`, String(r.clasificacion));
    const estNode= getOrPush(cNode.children!, `${cNode.key}|est:${r.estacion}`, r.estacion);
    const sgNode = getOrPush(estNode.children!, `${estNode.key}|sg:${r.scrapGroup}`, r.scrapGroup);
    const hNode  = getOrPush(sgNode.children!, `${sgNode.key}|h:${r.hallazgo}`, r.hallazgo);
    const eNode  = getOrPush(hNode.children!, `${hNode.key}|e:${r.especialista}`, r.especialista);
    eNode.qty = (eNode.qty ?? 0) + r.qty;
  }

  const sumQty = (node: HierNode): number => {
    if (!node.children || node.children.length === 0) return node.qty ?? 0;
    let s = 0; for (const ch of node.children) s += sumQty(ch); node.qty = s; return s;
  };
  for (const root of supervisors.values()) sumQty(root);
  return Array.from(supervisors.values());
}

// Agregados
function buildAggs(rows: RowFlat[]): DailyAggs {
  const byClas = new Map<Clasificacion, number>();
  const byGroup = new Map<string, number>();
  const byEsp = new Map<string, { especialista: string; qty: number; clasificacion: Clasificacion }>();

  for (const r of rows) {
    byClas.set(r.clasificacion, (byClas.get(r.clasificacion) ?? 0) + r.qty);
    byGroup.set(r.scrapGroup, (byGroup.get(r.scrapGroup) ?? 0) + r.qty);
    const key = `${r.especialista}|${r.clasificacion}`;
    const curr = byEsp.get(key) ?? { especialista: r.especialista, qty: 0, clasificacion: r.clasificacion };
    curr.qty += r.qty; byEsp.set(key, curr);
  }

  const byClasificacion = Array.from(byClas, ([clasificacion, qty]) => ({ clasificacion, qty }));
  const byScrapGroup = Array.from(byGroup, ([scrapGroup, qty]) => ({ scrapGroup, qty }));
  const topEspecialistas = Array.from(byEsp.values()).sort((a,b)=>b.qty-a.qty).slice(0, 20);
  const totalScrap = rows.reduce((a,r)=>a+r.qty,0);

  return { byClasificacion, byScrapGroup, topEspecialistas, totalScrap };
}

// Query
export async function queryDaily(db: SQLDatabase, filters: DailyFilters): Promise<DailyResult> {
  const from = startOfDayMs(filters.date);
  const to   = endOfDayMs(filters.date);
  const shiftClause = filters.shift && filters.shift !== "ALL" ? "AND shift = $shift" : "";

  const sql = `
    SELECT
      COALESCE(supervisor,'Not defined')           AS supervisor,
      COALESCE(classification,'Not defined')       AS clasificacion,
      COALESCE(estacion_root_cause,'Not defined')  AS estacion,
      COALESCE(scrap_group,'Not defined')          AS scrapGroup,
      COALESCE(finding,'Not defined')              AS hallazgo,
      COALESCE(especialista,'Not defined')         AS especialista,
      SUM(qty)                                     AS qty
    FROM scrap_entries
    WHERE scrap_date_epoch >= $from AND scrap_date_epoch <= $to
      ${shiftClause}
      AND COALESCE(classification, 'Not defined') <> 'Not defined'
      AND COALESCE(scrap_group, 'Not defined') <> 'Not defined'
      AND COALESCE(estacion_root_cause, 'Not defined') <> 'Not defined'
      AND COALESCE(persona_root_cause, 'Not defined') <> 'Not defined'
    GROUP BY supervisor, clasificacion, estacion, scrapGroup, hallazgo, especialista
  `;

  const stmt: SQLStatement = db.prepare(sql);
  stmt.bind?.({
    $from: from,
    $to: to,
    $shift: filters.shift && filters.shift !== "ALL" ? filters.shift : null,
  });

  const rows: RowFlat[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject();
    rows.push({
      supervisor: String(r.supervisor ?? "Not defined"),
      clasificacion: String(r.clasificacion ?? "Not defined"),
      estacion: String(r.estacion ?? "Not defined"),
      scrapGroup: String(r.scrapGroup ?? "Not defined"),
      hallazgo: String(r.hallazgo ?? "Not defined"),
      especialista: String(r.especialista ?? "Not defined"),
      qty: Number(r.qty ?? 0),
    });
  }
  stmt.free();

  return { hierarchy: buildHierarchy(rows), aggs: buildAggs(rows) };

}
