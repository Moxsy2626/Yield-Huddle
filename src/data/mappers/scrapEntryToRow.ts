import type { ScrapEntry } from "@/entities/scrap/ScrapEntry";
import type { ScrapRow } from "@/domain/entities/ScrapRow";

export function mapEntryToScrapRow(e: ScrapEntry): ScrapRow {
  const ts = e.workDate || e.scrapDate || "";
  return {
    id: e.container,
    container: e.container,
    supervisor: e.assessedBy ?? "N/D",
    specialist: e.personaRootCause ?? "N/D",
    classification: e.classification ?? "Not defined",
    scrapGroup: e.scrapGroup ?? "Not defined",
    station: e.estacionRootCause ?? "N/D",
    units: 1,
    unitDetails: [
      {
        id: e.container,
        timestamp: ts,                           // ← fecha usada en Diario
        comment: e.finding || e.comment || "-",
        station: e.estacionRootCause ?? "N/D",
        specialist: e.personaRootCause ?? "N/D",
        // @ts-expect-error extend
        scrapGroup: e.scrapGroup ?? "Not defined",
        shift: e.shift ?? "",
      },
    ],
  };
}

export function mapEntriesToRows(entries: ScrapEntry[]): ScrapRow[] {
  return entries.map(mapEntryToScrapRow);
}
