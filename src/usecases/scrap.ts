// src/usecases/scrap.ts

import type {
  IScrapRepo,
  ScrapEntry,
  ClassAgg,
  GroupAgg,
  Shift,
} from '@/entities/scrap';

/**
 * Helpers puros para agregar resultados
 */
function aggregateByClassification(rows: ScrapEntry[]): ClassAgg[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.classification, (map.get(r.classification) ?? 0) + r.units);
  }
  return Array.from(map.entries()).map(([classification, units]) => ({
    classification,
    units,
  }));
}

function aggregateByGroup(rows: ScrapEntry[]): GroupAgg[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.scrapGroup, (map.get(r.scrapGroup) ?? 0) + r.units);
  }
  return Array.from(map.entries()).map(([group, units]) => ({ group, units }));
}

/**
 * ========= CASOS DE USO =========
 * Son funciones puras que orquestan la obtención y preparación
 * de datos para la UI. Inyectan el repositorio como dependencia.
 */

/**
 * Caso de uso: Dashboard Diario
 * Retorna los registros del día y los agregados para gráficos.
 */
export async function getDaily(
  repo: IScrapRepo,
  params: { dateISO: string; shift?: Shift }
): Promise<{
  rows: ScrapEntry[];
  byClass: ClassAgg[];
  byGroup: GroupAgg[];
}> {
  const rows = await repo.fetchDaily(params.dateISO, params.shift);
  return {
    rows,
    byClass: aggregateByClassification(rows),
    byGroup: aggregateByGroup(rows),
  };
}

/**
 * Caso de uso: Dashboard Semanal
 * (Entrega rows “crudos” por ahora. Puedes agregar agregados si los usas.)
 */
export async function getWeekly(
  repo: IScrapRepo,
  params: { weekISO: string }
): Promise<{ rows: ScrapEntry[] }> {
  const rows = await repo.fetchWeekly(params.weekISO);
  return { rows };
}

/**
 * Caso de uso: Dashboard Mensual
 */
export async function getMonthly(
  repo: IScrapRepo,
  params: { monthISO: string }
): Promise<{ rows: ScrapEntry[] }> {
  const rows = await repo.fetchMonthly(params.monthISO);
  return { rows };
}

/**
 * Si en algún momento quieres exponer helpers para la UI (por ejemplo,
 * formateos, transformaciones adicionales), exporta funciones puras aquí.
 */
export const scrapAggregations = {
  aggregateByClassification,
  aggregateByGroup,
};
