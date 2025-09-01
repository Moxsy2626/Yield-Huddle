// src/data/sqlite.ts
import initSqlJs from "sql.js";

/** Statement mínimo para trabajar con sql.js */
export type SQLStatement = {
  bind?: (params: Record<string, unknown> | unknown[]) => boolean | void;
  run?: (params?: Record<string, unknown> | unknown[]) => boolean | void;
  step: () => boolean;
  free: () => void;
  reset?: () => void;
  clearBindings?: () => void;
  getAsObject: () => Record<string, unknown>;
};

/** DB mínima que usan nuestras queries */
export type SQLDatabase = {
  prepare: (sql: string) => SQLStatement;
};

/** Tipos internos (no se exportan) para crear la instancia real */
type SqlStatic = Awaited<ReturnType<typeof initSqlJs>>;
type Database = InstanceType<SqlStatic["Database"]>;

/** Datos de prueba */
type SeedRow = {
  epoch: number;
  group: string;
  classification: string;
  supervisor?: string;
  especialista?: string;
  estacion?: string;
  persona?: string;
  finding?: string;
  shift?: "A" | "B" | "C";
  qty: number;
};

const now = Date.now();
const SEED_ROWS: SeedRow[] = [
  { epoch: now, group: "Ensamble",  classification: "Handling",    supervisor: "Sup-1", especialista: "Esp-1", estacion: "ST-1", persona: "PR-1", finding: "Falla X", shift: "A", qty: 5  },
  { epoch: now, group: "Soldadura", classification: "Workmanship", supervisor: "Sup-2", especialista: "Esp-2", estacion: "ST-2", persona: "PR-2", finding: "Falla Y", shift: "B", qty: 10 },
  { epoch: now, group: "Corte",     classification: "Technical",   supervisor: "Sup-1", especialista: "Esp-3", estacion: "ST-3", persona: "PR-3", finding: "Falla Z", shift: "A", qty: 7  },
  { epoch: now, group: "Pintura",   classification: "Training",    supervisor: "Sup-3", especialista: "Esp-4", estacion: "ST-4", persona: "PR-4", finding: "Falla W", shift: "C", qty: 3  },
];

/** Inserta tolerando .run o .bind según la build de sql.js */
function execInsert(stmt: SQLStatement, params: Record<string, unknown>) {
  if (stmt.run) stmt.run(params);
  else if (stmt.bind) { stmt.bind(params); stmt.step(); }
  else throw new Error("Statement no soporta run/bind");
  stmt.free();
}

/** Crea la DB en memoria y siembra si está vacía */
export async function loadDb(): Promise<SQLDatabase> {
  const SQL: SqlStatic = await initSqlJs({
    locateFile: (file: string) => "/" + file, // asegúrate de tener /public/sql-wasm.wasm
  });
  const db: Database = new SQL.Database();

  // Esquema
  db.prepare(`
    CREATE TABLE IF NOT EXISTS scrap_entries (
      id INTEGER PRIMARY KEY,
      scrap_date_epoch INTEGER NOT NULL,
      scrap_group TEXT NOT NULL,
      classification TEXT NOT NULL,
      supervisor TEXT,
      especialista TEXT,
      estacion_root_cause TEXT,
      persona_root_cause TEXT,
      finding TEXT,
      shift TEXT,
      qty INTEGER NOT NULL
    )
  `).step();

  // ¿Hay datos?
  const cStmt = db.prepare("SELECT COUNT(*) as c FROM scrap_entries") as unknown as SQLStatement;
  cStmt.step();
  const current = Number((cStmt.getAsObject().c as number) ?? 0);
  cStmt.free();

  // Seed si está vacía
  if (current === 0) {
    const sql = `
      INSERT INTO scrap_entries (
        scrap_date_epoch, scrap_group, classification, supervisor,
        especialista, estacion_root_cause, persona_root_cause,
        finding, shift, qty
      ) VALUES (
        $epoch, $group, $class, $sup, $esp, $est, $per, $find, $shift, $qty
      )
    `;
    for (const row of SEED_ROWS) {
      const stmt = db.prepare(sql) as unknown as SQLStatement;
      execInsert(stmt, {
        $epoch: row.epoch,
        $group: row.group,
        $class: row.classification,
        $sup: row.supervisor ?? null,
        $esp: row.especialista ?? null,
        $est: row.estacion ?? null,
        $per: row.persona ?? null,
        $find: row.finding ?? null,
        $shift: row.shift ?? null,
        $qty: row.qty,
      });
    }
  }

  // Adaptador mínimo
  const minimal: SQLDatabase = {
    prepare: (sql: string) => db.prepare(sql) as unknown as SQLStatement,
  };
  return minimal;
}
