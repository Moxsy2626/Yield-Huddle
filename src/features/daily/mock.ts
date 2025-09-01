import type { ScrapEntry, Shift } from '@/entities/scrap';

/**
 * Pequeño generador determinista por fecha+turno para que el mock sea estable.
 */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return (t % 1000) / 1000; // 0..1
  };
}

const GROUPS = ['Corte', 'Soldadura', 'Ensamble', 'Pintura'] as const;
const CLASS = ['Proceso', 'Retrabajo', 'Desperdicio'] as const;

export function makeDailyMock(date: string, shift: Shift): ScrapEntry[] {
  const rnd = seededRandom(`${date}-${shift}`);
  const rows: ScrapEntry[] = [];

  const total = 30; // filas
  for (let i = 0; i < total; i++) {
    const g = GROUPS[Math.floor(rnd() * GROUPS.length)];
    const c = CLASS[Math.floor(rnd() * CLASS.length)];
    const u = 1 + Math.floor(rnd() * 20);

    rows.push({
      id: i + 1,
      date,
      shift,
      supervisor: `Sup-${Math.ceil(rnd() * 5)}`,
      specialist: `Esp-${Math.ceil(rnd() * 6)}`,
      scrapGroup: g,
      classification: c,
      stationRootCause: rnd() > 0.6 ? `ST-${Math.ceil(rnd() * 5)}` : null,
      personaRootCause: rnd() > 0.7 ? `PR-${Math.ceil(rnd() * 5)}` : null,
      finding: `Hallazgo ${Math.ceil(rnd() * 200)}`,
      units: u,
    });
  }

  return rows;
}
