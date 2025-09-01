<<<<<<< HEAD
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
=======
// src/entities/scrap.ts

/**
 * Turnos operativos. Ajusta si manejas más.
 */
export type Shift = 'A' | 'B';

/**
 * Registro atómico de scrap (lo que se guarda en la DB).
 * - date: ISO YYYY-MM-DD
 * - units: cantidad de unidades afectadas
 */
export interface ScrapEntry {
  id: number;
  date: string; // YYYY-MM-DD
  shift: Shift;
  scrapGroup: string;         // p.ej. Ensamble, Soldadura, Corte, Pintura ...
  classification: string;     // p.ej. Proceso, Desperdicio, Retrabajo ...
  supervisor: string;
  specialist: string;
  stationRootCause?: string | null;
  personaRootCause?: string | null;
  finding: string;            // descripción breve
  units: number;
}

/**
 * Agregados típicos para los gráficos del dashboard diario
 */
export interface ClassAgg {
  classification: string;
  units: number;
}

export interface GroupAgg {
  group: string;
  units: number;
}

/**
 * Contrato del repositorio (infra) que alimenta los casos de uso.
 * Esto nos mantiene en Clean Architecture: la capa de dominio desconoce
 * cómo se obtiene la data (SQLite, API, etc).
 */
export interface IScrapRepo {
  /**
   * Registros del día. Si se pasa shift, filtra por turno.
   * dateISO = 'YYYY-MM-DD'
   */
  fetchDaily(dateISO: string, shift?: Shift): Promise<ScrapEntry[]>;

  /**
   * Registros de una semana. weekISO = 'YYYY-Www' (ISO 8601)
   * (Si prefieres, puedes usar cualquier convención estable).
   */
  fetchWeekly(weekISO: string): Promise<ScrapEntry[]>;

  /**
   * Registros de un mes. monthISO = 'YYYY-MM'
   */
  fetchMonthly(monthISO: string): Promise<ScrapEntry[]>;
>>>>>>> bbeff7aa87bc1a5e13421671f4fbc480de4b59ee
}
