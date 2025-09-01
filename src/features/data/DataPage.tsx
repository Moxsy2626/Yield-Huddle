import React, { useEffect, useState } from "react";
import {
  Box, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField,
  Typography, Paper, Stack,
} from "@mui/material";

import type { ScrapEntry } from "@/entities/scrap/ScrapEntry";
import { getAllScrap, insertScrap, bulkInsertScrap, clearScrap } from "@/infrastructure/repositories/ScrapRepository";

const HEADER = [
  "Container","Scrap Date","Code","Scrap Reason","Scrap Group","Classification","Subgroup","Finding",
  "Turno Root Cause","Estacion Root Cause","Persona Root Cause","Assessed By",
  "Comment","Material","Employee","Scrap Toolkit","Build","Shift","Missing Fields","Work Date",
] as const;

export default function DataPage() {
  const [rows, setRows] = useState<ScrapEntry[]>([]);
  const [form, setForm] = useState<Partial<ScrapEntry>>({});
  const [paste, setPaste] = useState("");

  async function reload() {
    const dbRows = await getAllScrap();
    setRows(dbRows);
  }
  useEffect(() => { reload(); }, []);

  const setF = (k: keyof ScrapEntry, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const parsePasted = (text: string): ScrapEntry[] => {
    const lines = text.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
    if (!lines.length) return [];
    const first = lines[0].split(/\t|,/);
    const hasHeader = first[0].toLowerCase().includes("container");
    const start = hasHeader ? 1 : 0;

    const to = (arr: string[]): ScrapEntry => ({
      container: arr[0],
      scrapDate: arr[1],
      code: arr[2],
      scrapReason: arr[3],
      scrapGroup: arr[4],
      classification: arr[5],
      subgroup: arr[6],
      finding: arr[7],
      turnoRootCause: arr[8],
      estacionRootCause: arr[9],
      personaRootCause: arr[10],
      assessedBy: arr[11],
      comment: arr[12],
      material: arr[13],
      employee: arr[14],
      scrapToolkit: arr[15],
      build: arr[16],
      shift: arr[17],
      missingFields: arr[18],
      workDate: arr[19],
    });

    return lines.slice(start).map((ln) => {
      const cols = ln.split(/\t|,/);
      return to(HEADER.map((_, i) => (cols[i] ?? "").trim()));
    }).filter(e => e.container && e.workDate);
  };

  const saveAll = async () => {
    const entries = parsePasted(paste);
    if (!entries.length) return;
    await bulkInsertScrap(entries);
    setPaste("");
    await reload();
  };

  const saveOne = async () => {
    if (!form.container || !form.workDate) return;
    await insertScrap(form as ScrapEntry);
    setForm({});
    await reload();
  };

  return (
    <Box p={2}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Datos</Typography>

      <Paper variant="outlined" sx={{ p:2, mb:3 }}>
        <Typography variant="subtitle1" sx={{ mb:1 }}>Pegar filas (mismo orden de columnas)</Typography>
        <TextField
          label="Pega aquí (TSV/CSV)"
          multiline minRows={6} fullWidth
          value={paste}
          onChange={(e)=>setPaste(e.target.value)}
          placeholder={HEADER.join("\t")}
        />
        <Stack direction="row" spacing={1} sx={{ mt:1 }}>
          <Button variant="contained" onClick={saveAll}>Guardar todas</Button>
          <Button color="error" onClick={async ()=>{ await clearScrap(); await reload(); }}>Borrar todo</Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p:2, mb:3 }}>
        <Typography variant="subtitle1" sx={{ mb:2 }}>Agregar una fila</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          {HEADER.map((k)=>(
            <TextField key={k} label={k} value={(form as any)[toKey(k)] ?? ""} onChange={(e)=>setF(toKey(k), e.target.value)} />
          ))}
        </Box>
        <Button variant="contained" onClick={saveOne}>Guardar fila</Button>
      </Paper>

      <Typography variant="h6" sx={{ mb:1 }}>Registros ({rows.length})</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>{HEADER.map((h)=><TableCell key={h}>{h}</TableCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i)=>(
            <TableRow key={i}>
              {HEADER.map((h)=> <TableCell key={h}>{(r as any)[toKey(h)] ?? ""}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function toKey(h: typeof HEADER[number]): keyof ScrapEntry {
  const map: Record<string, keyof ScrapEntry> = {
    "Container":"container",
    "Scrap Date":"scrapDate",
    "Code":"code",
    "Scrap Reason":"scrapReason",
    "Scrap Group":"scrapGroup",
    "Classification":"classification",
    "Subgroup":"subgroup",
    "Finding":"finding",
    "Turno Root Cause":"turnoRootCause",
    "Estacion Root Cause":"estacionRootCause",
    "Persona Root Cause":"personaRootCause",
    "Assessed By":"assessedBy",
    "Comment":"comment",
    "Material":"material",
    "Employee":"employee",
    "Scrap Toolkit":"scrapToolkit",
    "Build":"build",
    "Shift":"shift",
    "Missing Fields":"missingFields",
    "Work Date":"workDate",
  };
  return map[h];
}
