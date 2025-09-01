// src/features/daily/data/queries/DailyService.sqlite.ts
import type { IDailyService } from "@/features/daily/ports/IDailyService";
import type { DailyResult, ScrapRow } from "@/features/daily/ports/types";

// ✅ IMPORTS QUE FALTABAN
import { getAllScrap } from "@/infrastructure/repositories/ScrapRepository";
import { mapEntriesToRows } from "@/data/mappers/scrapEntryToRow";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// Parser robusto: devuelve timestamp (ms) o null
const parseWorkTs = (s: unknown): number | null => {
  if (!s) return null;
  const str = String(s).trim();
  const formats = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "D/M/YYYY",
    "M/D/YYYY",
    "M/D/YY h:mm A",
    "D/M/YY h:mm A",
    "YYYY-MM-DD",
    "YYYY/MM/DD",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DDTHH:mm:ss",
  ];
  for (const f of formats) {
    const d = dayjs(str, f, true);
    if (d.isValid()) return d.valueOf();
  }
  const lax = dayjs(str);
  return lax.isValid() ? lax.valueOf() : null;
};

export const DailyServiceSqliteAdapter: IDailyService = {
  async queryDaily({ date, shift }) {
    // 1) Leer todo lo cargado en la pestaña Data (SQLite)
    const entries = await getAllScrap();
    const rows = mapEntriesToRows(entries) as ScrapRow[];

    // 2) Ventana del día seleccionado (inclusiva)
    const d0 = dayjs(date).startOf("day").valueOf();
    const d1 = dayjs(date).endOf("day").valueOf();

    // 3) Filtrar por Work Date + Turno
    const filtered = rows.filter((r: any) => {
      // Usa Work Date de Data; si no viene, cae a unitDetails[0].timestamp
      const srcDate =
        r.workDate ?? r.work_date ?? r.WorkDate ?? r.unitDetails?.[0]?.timestamp;
      const ts = parseWorkTs(srcDate);
      if (ts == null) return false;

      const okDate = ts >= d0 && ts <= d1;

      // Turno preferentemente desde Data; si no, unitDetails[0].shift
      const rowShift: string | undefined =
        r.shift ?? r.Shift ?? r.unitDetails?.[0]?.shift;
      const okShift = shift ? rowShift === shift : true;

      return okDate && okShift;
    });

    return { rows: filtered } as DailyResult;
  },
};
