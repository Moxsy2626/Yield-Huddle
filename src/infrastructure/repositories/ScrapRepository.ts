// src/infrastructure/repositories/ScrapRepository.ts
import { db, persistDb } from "@/data/sqlite";
import type { ScrapEntry } from "@/entities/scrap/ScrapEntry";

export async function clearScrap() {
  db!.run(`DELETE FROM scrap;`);
  persistDb();
}

export async function bulkInsertScrap(entries: ScrapEntry[]) {
  const stmt = db!.prepare(`
    INSERT OR REPLACE INTO scrap (
      container, scrapDate, code, scrapReason, scrapGroup, classification, subgroup, finding,
      turnoRootCause, estacionRootCause, personaRootCause, assessedBy,
      comment, material, employee, scrapToolkit, build, shift, missingFields, workDate
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  db!.run("BEGIN");
  try {
    for (const e of entries) {
      stmt.run([
        e.container ?? "",
        e.scrapDate ?? "",
        e.code ?? "",
        e.scrapReason ?? "",
        e.scrapGroup ?? "",
        e.classification ?? "",
        e.subgroup ?? "",
        e.finding ?? "",
        e.turnoRootCause ?? "",
        e.estacionRootCause ?? "",
        e.personaRootCause ?? "",
        e.assessedBy ?? "",
        e.comment ?? "",
        e.material ?? "",
        e.employee ?? "",
        e.scrapToolkit ?? "",
        e.build ?? "",
        e.shift ?? "",
        e.missingFields ?? "",
        e.workDate ?? "",
      ]);
    }
    db!.run("COMMIT");
    persistDb(); // ← guarda en localStorage
  } catch (e) {
    db!.run("ROLLBACK");
    throw e;
  } finally {
    stmt.free();
  }
}

export async function insertScrap(e: ScrapEntry) {
  await bulkInsertScrap([e]);
}

export async function getAllScrap(): Promise<ScrapEntry[]> {
  const res = db!.exec(`
    SELECT container, scrapDate, code, scrapReason, scrapGroup, classification, subgroup, finding,
           turnoRootCause, estacionRootCause, personaRootCause, assessedBy,
           comment, material, employee, scrapToolkit, build, shift, missingFields, workDate
    FROM scrap
    ORDER BY workDate, container
  `);
  if (!res.length) return [];
  const rows = res[0].values;
  const cols = res[0].columns;
  return rows.map((r) => Object.fromEntries(r.map((v, i) => [cols[i], v])) as ScrapEntry);
}
