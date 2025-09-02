// src/data/sqlite.ts
import initSqlJs, { Database } from "sql.js";

const LS_KEY = "scrap-db.v1";

let db: Database | null = null;

function loadFromLocalStorage(): Uint8Array | null {
  try {
    const b64 = localStorage.getItem(LS_KEY);
    if (!b64) return null;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function saveToLocalStorage(d: Database) {
  try {
    const bytes = d.export();
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    localStorage.setItem(LS_KEY, b64);
  } catch {
    // noop
  }
}

/** Llama a esto una vez antes de renderizar la app */
export async function initDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const bytes = loadFromLocalStorage();
  db = bytes ? new SQL.Database(bytes) : new SQL.Database();

  // Esquema
  db.run(`
    CREATE TABLE IF NOT EXISTS scrap (
      container TEXT PRIMARY KEY,
      scrapDate TEXT,
      code TEXT,
      scrapReason TEXT,
      scrapGroup TEXT,
      classification TEXT,
      subgroup TEXT,
      finding TEXT,
      turnoRootCause TEXT,
      estacionRootCause TEXT,
      personaRootCause TEXT,
      assessedBy TEXT,
      comment TEXT,
      material TEXT,
      employee TEXT,
      scrapToolkit TEXT,
      build TEXT,
      shift TEXT,
      missingFields TEXT,
      workDate TEXT
    );
  `);

  // guardar inmediatamente (asegura que existe LS_KEY)
  saveToLocalStorage(db);
  return db;
}

/** Forzar guardado (se llama tras inserciones/borrados) */
export function persistDb() {
  if (db) saveToLocalStorage(db);
}

export { db };
