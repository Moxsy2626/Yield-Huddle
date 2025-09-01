import type { IDailyService } from "../../../ports/IDailyService";
import type { DailyResult, ScrapRow, UnitDetail } from "../../../ports/types";

/**
 * PRNG determinístico (xorshift) para que el mock sea estable por día/turno.
 */
function makeRng(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let x = h || 123456789;
  return () => {
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

const CLASSIFICATIONS = ["Handling", "Workmanship", "Technical", "Training"] as const;
const GROUPS = ["Ensamble", "Corte", "Soldadura", "Pintura"] as const;
const STATIONS = ["Estación A", "Estación B", "Estación C"] as const;
const SUPERVISORS = ["Carlos", "Laura", "Marta"] as const;
const SPECIALISTS = [
  "Esp-1", "Esp-2", "Esp-3", "Esp-4", "Esp-5", "Esp-6", "Esp-7", "Esp-8",
] as const;

type Shift = "A" | "B" | "C" | undefined;

/**
 * Genera N filas de scrap con detalles por unidad.
 * - units = cantidad total (también se generan `unitDetails.length === units`).
 */
function generateRows(rng: () => number, count: number, dateISO: string, shift?: Shift): ScrapRow[] {
  const rows: ScrapRow[] = [];
  let idCounter = 1;

  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  for (let i = 0; i < count; i++) {
    const supervisor = pick(SUPERVISORS);
    const specialist = pick(SPECIALISTS);
    const classification = pick(CLASSIFICATIONS);
    const scrapGroup = pick(GROUPS);
    const station = pick(STATIONS);
    const units = randInt(1, 12);

    const unitDetails: UnitDetail[] = Array.from({ length: units }).map((_, u) => ({
      id: `${idCounter}-${u + 1}`,
      timestamp: `${dateISO} ${String(randInt(6, 18)).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}`,
      comment: rng() > 0.8 ? "Nota de inspección" : undefined,
      station,
      specialist,
    }));

    rows.push({
      id: idCounter++,
      scrapGroup,
      classification,
      supervisor,
      specialist,
      station,
      units,
      date: dateISO,
      shift: shift as any,
      unitDetails,
    });
  }

  return rows;
}

/**
 * Crea un conjunto *coherente* de filas a partir de la fecha/turno.
 * - Distribuye registros por cada supervisor/estación/grupo.
 */
function buildMockFor(date: Date, shift?: Shift): DailyResult {
  const dateISO = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
  const seed = `${dateISO}|${shift ?? "ALL"}`;
  const rng = makeRng(seed);

  // Cantidad base de filas según turno (ALL genera más)
  const base = shift ? 18 : 28;

  // Mezcla de diferentes “bloques” para dar variedad
  const rows: ScrapRow[] = [
    ...generateRows(rng, Math.floor(base * 0.4), dateISO, shift),
    ...generateRows(rng, Math.floor(base * 0.35), dateISO, shift),
    ...generateRows(rng, Math.floor(base * 0.25), dateISO, shift),
  ];

  return { rows };
}

/**
 * Adapter Mock que implementa el puerto IDailyService.
 * Usa latencia artificial pequeña para emular red.
 */
export const DailyServiceMockAdapter: IDailyService = {
  async queryDaily({ date, shift }) {
    // Simula red
    await new Promise((r) => setTimeout(r, 120));
    return buildMockFor(date, shift);
  },
};
