import { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, Typography, Box, Stack,
  MenuItem, Select, InputLabel, FormControl, TextField, Divider
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useFiltersStore, type Turno } from "@/store/filters";
import { queryDaily } from "@/data/queries/queryDaily";
import type { DailyResult } from "@/data/queries/queryDaily";
import { loadDb, type SQLDatabase } from "@/data/sqlite";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";

import DailyTable from "./components/DailyTable"; // tabla plana (más adelante TreeData)

// Colores (luego migraremos a tokens del theme)
const CLASS_COLORS: Record<string, string> = {
  Handling: "#6aa84f",
  Workmanship: "#3c78d8",
  Technical: "#cc0000",
  Training: "#f1c232",
  "Not defined": "#999999",
};

// Tipo base de fila (lo infiero de tu DataGrid actual)
type ScrapRow = {
  id: string | number;
  scrapGroup?: string;
  classification?: string;
  supervisor?: string;
  specialist?: string;
  station?: string;          // opcional (si viene)
  units: number;
  [k: string]: any;
};

type TopItem = { especialista: string; qty: number; clasificacion: string };

// Helper para opciones únicas
function uniq<T>(arr: (T | undefined | null)[]) {
  return Array.from(new Set(arr.filter(Boolean) as T[]));
}

export default function DailyPage() {
  // ===== Filtros globales existentes (fecha/turno) =====
  const date = useFiltersStore((s) => s.date);
  const shift = useFiltersStore((s) => s.shift);
  const setDate = useFiltersStore((s) => s.setDate);
  const setShift = useFiltersStore((s) => s.setShift);
  const dayjsDate = useMemo<Dayjs>(() => dayjs(date), [date]);

  // ===== Estado local =====
  const [db, setDb] = useState<SQLDatabase | null>(null);
  const [data, setData] = useState<DailyResult | null>(null);

  // Confirmadas para yield-loss
  const [confirmadas, setConfirmadas] = useState<number>(0);

  // Filtro del Top (clasificación)
  const [clasForTop, setClasForTop] = useState<string>("ALL");

  // Filtros extra (cliente)
  const [fSupervisor, setFSupervisor] = useState<string>("ALL");
  const [fSpecialist, setFSpecialist] = useState<string>("ALL");
  const [fClas, setFClas]         = useState<string>("ALL");
  const [fGroup, setFGroup]       = useState<string>("ALL");
  const [fStation, setFStation]   = useState<string>("ALL");

  // ===== Cargar DB una vez =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (db) return;
      const database = await loadDb();
      if (!cancelled) setDb(database);
    })();
    return () => { cancelled = true; };
  }, [db]);

  // ===== Consultar datos =====
  useEffect(() => {
    if (!db) return;
    (async () => {
      const result = await queryDaily(db, {
        date,
        shift: shift === "ALL" ? undefined : shift, // mismo comportamiento que ya tenías
      });
      setData(result);
    })();
  }, [db, date, shift]);

  // ===== Filas base del día (siempre guardo una copia segura) =====
  const rows: ScrapRow[] = useMemo(() => {
    // si DailyResult no trae filas, devuelvo arreglo vacío
    return ((data as any)?.rows ?? []) as ScrapRow[];
  }, [data]);

  // ===== Construir opciones únicas para los selects =====
  const options = useMemo(() => {
    return {
      supervisors: uniq<string>(rows.map(r => r.supervisor)),
      specialists: uniq<string>(rows.map(r => r.specialist)),
      classifications: uniq<string>(rows.map(r => r.classification)),
      groups: uniq<string>(rows.map(r => r.scrapGroup)),
      stations: uniq<string>(rows.map(r => r.station)),
    };
  }, [rows]);

  // ===== Aplicar filtros locales sobre filas =====
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (fSupervisor !== "ALL" && r.supervisor !== fSupervisor) return false;
      if (fSpecialist !== "ALL" && r.specialist !== fSpecialist) return false;
      if (fClas !== "ALL" && r.classification !== fClas) return false;
      if (fGroup !== "ALL" && r.scrapGroup !== fGroup) return false;
      if (fStation !== "ALL" && r.station !== fStation) return false;
      return true;
    });
  }, [rows, fSupervisor, fSpecialist, fClas, fGroup, fStation]);

  // ===== Recalcular agregados desde filteredRows =====
  const byClas = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of filteredRows) {
      const key = r.classification ?? "Not defined";
      m.set(key, (m.get(key) ?? 0) + (Number(r.units) || 0));
    }
    return Array.from(m.entries()).map(([clasificacion, qty]) => ({ clasificacion, qty }));
  }, [filteredRows]);

  const byGroup = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of filteredRows) {
      const key = r.scrapGroup ?? "Not defined";
      m.set(key, (m.get(key) ?? 0) + (Number(r.units) || 0));
    }
    return Array.from(m.entries()).map(([scrapGroup, qty]) => ({ scrapGroup, qty }));
  }, [filteredRows]);

  const totalScrap = useMemo(
    () => filteredRows.reduce((acc, r) => acc + (Number(r.units) || 0), 0),
    [filteredRows]
  );

  const topItems: TopItem[] = useMemo(() => {
    const m = new Map<string, { qty: number; clasificacion: string }>();
    for (const r of filteredRows) {
      const esp = String(r.specialist ?? "N/D");
      const clas = String(r.classification ?? "Not defined");
      const prev = m.get(esp) ?? { qty: 0, clasificacion: clas };
      m.set(esp, { qty: prev.qty + (Number(r.units) || 0), clasificacion: clas });
    }
    return Array.from(m.entries())
      .map(([especialista, v]) => ({ especialista, qty: v.qty, clasificacion: v.clasificacion }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [filteredRows]);

  const filteredTopItems = useMemo(() => {
    if (clasForTop === "ALL") return topItems;
    return topItems.filter(t => t.clasificacion === clasForTop);
  }, [topItems, clasForTop]);

  // ===== Yield total y por clasificación =====
  const yieldTotal = useMemo(() => {
    const base = confirmadas + totalScrap;
    return base > 0 ? (totalScrap / base) * 100 : 0;
  }, [confirmadas, totalScrap]);

  const yieldByClas = useMemo(() => {
    const base = confirmadas + totalScrap;
    return byClas.map(row => ({
      clasificacion: row.clasificacion,
      scrap: row.qty,
      yieldPct: base > 0 ? (row.qty / base) * 100 : 0,
    }));
  }, [byClas, confirmadas, totalScrap]);

  // ===== Handlers =====
  const handleShiftChange = (e: SelectChangeEvent<Turno>) => setShift(e.target.value as Turno);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        <Typography variant="h5">Daily – Diario</Typography>

        {/* Filtros principales (fecha/turno) */}
        <Card>
          <CardHeader title="Filtros" />
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ width: 220 }}>
                <DatePicker label="Día" value={dayjsDate} onChange={(d) => d && setDate(d.toDate())} />
              </Box>
              <FormControl sx={{ width: 160 }}>
                <InputLabel id="shift-label">Turno</InputLabel>
                <Select<Turno> labelId="shift-label" label="Turno" value={shift} onChange={handleShiftChange}>
                  <MenuItem value="ALL">Todos</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                </Select>
              </FormControl>

              {/* Filtros extra */}
              <FormControl sx={{ width: 200 }}>
                <InputLabel id="f-supervisor">Supervisor</InputLabel>
                <Select labelId="f-supervisor" label="Supervisor" value={fSupervisor} onChange={e => setFSupervisor(String(e.target.value))}>
                  <MenuItem value="ALL">Todos</MenuItem>
                  {options.supervisors.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ width: 200 }}>
                <InputLabel id="f-specialist">Especialista</InputLabel>
                <Select labelId="f-specialist" label="Especialista" value={fSpecialist} onChange={e => setFSpecialist(String(e.target.value))}>
                  <MenuItem value="ALL">Todos</MenuItem>
                  {options.specialists.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ width: 200 }}>
                <InputLabel id="f-clas">Clasificación</InputLabel>
                <Select labelId="f-clas" label="Clasificación" value={fClas} onChange={e => setFClas(String(e.target.value))}>
                  <MenuItem value="ALL">Todas</MenuItem>
                  {options.classifications.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ width: 200 }}>
                <InputLabel id="f-group">Scrap Group</InputLabel>
                <Select labelId="f-group" label="Scrap Group" value={fGroup} onChange={e => setFGroup(String(e.target.value))}>
                  <MenuItem value="ALL">Todos</MenuItem>
                  {options.groups.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ width: 200 }}>
                <InputLabel id="f-station">Estación</InputLabel>
                <Select labelId="f-station" label="Estación" value={fStation} onChange={e => setFStation(String(e.target.value))}>
                  <MenuItem value="ALL">Todas</MenuItem>
                  {options.stations.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Gráfico por Clasificación */}
        <Card>
          <CardHeader title="Scrap por Clasificación" />
          <CardContent>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={byClas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clasificacion" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty">
                    {byClas.map((e, i) => (
                      <Cell key={i} fill={CLASS_COLORS[e.clasificacion] ?? "#888"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Gráfico por Scrap Group */}
        <Card>
          <CardHeader title="Scrap por Scrap Group" />
          <CardContent>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={byGroup}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scrapGroup" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Top de Especialistas con filtro de Clasificación */}
        <Card>
          <CardHeader
            title="Top de Especialistas (Top 10)"
            action={
              <FormControl sx={{ width: 220 }}>
                <InputLabel id="clas-top">Clasificación</InputLabel>
                <Select
                  labelId="clas-top"
                  label="Clasificación"
                  value={clasForTop}
                  onChange={(e) => setClasForTop(String(e.target.value))}
                >
                  <MenuItem value="ALL">Todas</MenuItem>
                  {options.classifications.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            }
          />
          <CardContent>
            {filteredTopItems.length === 0 ? (
              <Typography variant="body2">Sin datos para el día/turno seleccionados.</Typography>
            ) : (
              <Box sx={{ height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={filteredTopItems} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="especialista" />
                    <Tooltip />
                    <Bar dataKey="qty" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabla de registros (plana por ahora) */}
        <Card>
          <CardHeader title="Detalle de registros" />
          <CardContent>
            <DailyTable rows={filteredRows as any} />
          </CardContent>
        </Card>

        {/* Totales + Yield Loss */}
        <Card>
          <CardHeader title="Totales del día" />
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Typography>Scrap total: <b>{totalScrap}</b></Typography>
              <TextField
                type="number"
                label="Confirmadas"
                value={confirmadas}
                onChange={(e) => setConfirmadas(Number(e.target.value || 0))}
                sx={{ width: 180 }}
              />
              <Typography>Yield Loss total: <b>{yieldTotal.toFixed(2)}%</b></Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Yield por Clasificación</Typography>
            <ul style={{ margin: 0 }}>
              {yieldByClas.map(r => (
                <li key={r.clasificacion}>
                  {r.clasificacion}: {r.yieldPct.toFixed(2)}% (scrap {r.scrap})
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}
