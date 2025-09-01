
// src/features/daily/DailyPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, Typography, Box, Stack,
  MenuItem, Select, InputLabel, FormControl, TextField, Divider,
  Dialog, DialogTitle, DialogContent, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
  alpha, useTheme, Tooltip as MuiTooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
=======
import { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, Typography, Box, Stack,
  MenuItem, Select, InputLabel, FormControl
} from "@mui/material";


import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useFiltersStore, type Turno } from "@/store/filters";

// Componentes (presentación)
import DailyChart from "./components/DailyChart";
import { FilterAuto } from "./components/details/FilterAuto";
import { SupervisorRow } from "./components/details/SupervisorRow";
import { TopSpecialistsChart } from "./components/TopSpecialistsChart";

// Puertos / Tipos
import type { IDailyService } from "./ports/IDailyService";
import type { DailyResult, ScrapRow } from "./ports/types";

// Infraestructura (adapter por defecto)
import { DailyServiceMockAdapter } from "./components/data/queries/DailyService.mock";

// Usecases (dominio)
import { buildMap } from "./usecases/buildMap";
import { aggregateCantidad } from "./usecases/aggregate";
import { computeYieldBy } from "./usecases/computeYield";

/* =================== Paletas sobrias ===================== */
const CLASS_COLORS: Record<string, string> = {
  Handling:   "#2E7D32",
  Workmanship:"#1565C0",
  Technical:  "#B71C1C",
  Training:   "#B26A00",
  "Not defined": "#607D8B",
};
const GROUP_PALETTE = ["#0F766E","#1D4ED8","#6D28D9","#B45309","#B91C1C","#2563EB","#0EA5E9","#475569"];
const SUPERVISOR_PALETTE = ["#1E40AF","#0E7490","#7C3AED","#B45309","#9333EA","#047857","#2563EB","#7C2D12","#334155","#0F766E"];
const colorHash = (s: string, pal: string[]) => {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return pal[h % pal.length];
};
const uniq = <T,>(arr: (T | null | undefined)[]) => Array.from(new Set(arr.filter(Boolean) as T[]));

/* ===================== Página ============================ */
export default function DailyPage({ service }: { service?: IDailyService }) {
  const theme = useTheme();

  // Puerto con implementación por defecto (DIP)
  const dailyService: IDailyService = service ?? DailyServiceMockAdapter;

  // Filtros globales (store)
=======
import { queryDaily } from "@/data/queries/queryDaily";
import type { DailyResult } from "@/data/queries/queryDaily";
import { loadDb, type SQLDatabase } from "@/data/sqlite";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";

const CLASS_COLORS: Record<string, string> = {
  Handling: "#6aa84f",
  Workmanship: "#3c78d8",
  Technical: "#cc0000",
  Training: "#f1c232",
  "Not defined": "#999999",
};

type TopItem = { especialista: string; qty: number; clasificacion: string };

export default function DailyPage() {

  const date = useFiltersStore((s) => s.date);
  const shift = useFiltersStore((s) => s.shift);
  const setDate = useFiltersStore((s) => s.setDate);
  const setShift = useFiltersStore((s) => s.setShift);
  const dayjsDate = useMemo<Dayjs>(() => dayjs(date), [date]);

  // Estado local
  const [data, setData] = useState<DailyResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Confirmadas (placeholder "0")
  const [confirmadasStr, setConfirmadasStr] = useState<string>("");

  // Filtros de UI
  const [fSupervisor, setFSupervisor] = useState<string>("ALL");
  const [fSpecialist, setFSpecialist] = useState<string>("ALL");
  const [fClas, setFClas] = useState<string>("ALL");
  const [fGroup, setFGroup] = useState<string>("ALL");
  const [fStation, setFStation] = useState<string>("ALL");

  // Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState<string>("");
  const [detailRows, setDetailRows] = useState<ScrapRow[]>([]);

  const openDetail = useCallback((title: string, rows: ScrapRow[]) => {
    setDetailTitle(title);
    setDetailRows(rows);
    setDetailOpen(true);
  }, []);

  // Carga datos (solo cuando cambian día/turno o refresco)
  const fetchDaily = useCallback(async () => {
    setLoading(true);
    const result = await dailyService.queryDaily({
      date,
      shift: shift === "ALL" ? undefined : shift,
    });
    setData(result);
    setLoading(false);
  }, [dailyService, date, shift]);

  useEffect(() => { fetchDaily(); }, [fetchDaily]);
  const onRefresh = useCallback(() => { fetchDaily(); }, [fetchDaily]);

  // Datos base
  const rows: ScrapRow[] = useMemo(() => (data?.rows ?? []) as ScrapRow[], [data]);

  // Opciones filtros
  const options = useMemo(() => ({
    supervisors:   uniq<string>(rows.map(r => r.supervisor)),
    specialists:   uniq<string>(rows.map(r => r.specialist)),
    classifications: uniq<string>(rows.map(r => r.classification)),
    groups:        uniq<string>(rows.map(r => r.scrapGroup)),
    stations:      uniq<string>(rows.map(r => r.station)),
  }), [rows]);

  // Filtrado (se recalcula solo con filtros/rows)
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

  // Mapas (para abrir modal sin recalcular en clics)
  const mapClas     = useMemo(() => buildMap(filteredRows, r => (r.classification ?? "Not defined")), [filteredRows]);
  const mapGroup    = useMemo(() => buildMap(filteredRows, r => (r.scrapGroup ?? "Not defined")), [filteredRows]);
  const mapStation  = useMemo(() => buildMap(filteredRows, r => (r.station ?? "N/D")), [filteredRows]);
  const mapSup      = useMemo(() => buildMap(filteredRows, r => (r.supervisor ?? "N/D")), [filteredRows]);
  const mapSpec     = useMemo(() => buildMap(filteredRows, r => (r.specialist ?? "N/D")), [filteredRows]);

  // Agregados (Cantidad)
  const byClas      = useMemo(() => aggregateCantidad(mapClas).map(x => ({ clasificacion: x.key, cantidad: x.cantidad })), [mapClas]);
  const byGroup     = useMemo(() => aggregateCantidad(mapGroup).map(x => ({ scrapGroup: x.key, cantidad: x.cantidad })), [mapGroup]);
  const byStation   = useMemo(() => aggregateCantidad(mapStation).map(x => ({ station: x.key, cantidad: x.cantidad })), [mapStation]);
  const bySupervisor= useMemo(() => aggregateCantidad(mapSup).map(x => ({ supervisor: x.key, cantidad: x.cantidad })), [mapSup]);

  // Top especialistas (Top 10)
  const topItems = useMemo(
    () =>
      Object.entries(mapSpec)
        .map(([especialista, arr]) => ({
          especialista,
          cantidad: arr.reduce((a, r) => a + (r.units || 0), 0),
          clasificacion: arr[0]?.classification ?? "Not defined",
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10),
    [mapSpec]
  );

  // Totales + Yield
  const totalScrap = useMemo(() => filteredRows.reduce((a, r) => a + (r.units || 0), 0), [filteredRows]);
  const confirmadas = Number(confirmadasStr || 0);
  const baseYield = confirmadas + totalScrap;

  const yieldByClas = useMemo(() =>
    computeYieldBy(
      byClas.map(x => ({ key: x.clasificacion, cantidad: x.cantidad })), baseYield
    ), [byClas, baseYield]);

  const yieldByGroup = useMemo(() =>
    computeYieldBy(
      byGroup.map(x => ({ key: x.scrapGroup, cantidad: x.cantidad })), baseYield
    ), [byGroup, baseYield]);

  const yieldTotal = useMemo(() =>
    baseYield > 0 ? (totalScrap / baseYield) * 100 : 0,
    [totalScrap, baseYield]
  );

  /* ---------- estilos tarjetas ---------- */
  const cardSx = {
    borderRadius: 3,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
    overflow: "hidden",
  } as const;

  const headerSx = {
    pb: 0,
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.10)}, transparent)`,
  } as const;

  /* ================= RENDER ================= */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        {/* Header con refresh */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Daily – Diario</Typography>
          <MuiTooltip title={loading ? "Cargando..." : "Refrescar datos"}>
            <span>
              <IconButton onClick={onRefresh} disabled={loading} size="small" aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            </span>
          </MuiTooltip>
        </Stack>

        {/* Filtros */}
        <Card sx={cardSx}>
          <CardHeader title="Filtros" sx={headerSx} />
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ width: 220 }}>
                <DatePicker
                  label="Día"
                  value={dayjsDate}
                  onChange={(d) => d && setDate(d.startOf("day").toDate())}
                />
              </Box>

              <FormControl sx={{ width: 160 }}>
                <InputLabel id="shift-label">Turno</InputLabel>
                <Select<Turno> labelId="shift-label" label="Turno" value={shift}
                                onChange={(e: SelectChangeEvent<Turno>) => setShift(e.target.value as Turno)}>

  const [db, setDb] = useState<SQLDatabase | null>(null);
  const [data, setData] = useState<DailyResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (db) return;
      const database = await loadDb();
      if (!cancelled) setDb(database);
    })();
    return () => { cancelled = true; };
  }, [db]);

  useEffect(() => {
    if (!db) return;
    (async () => {
      const result = await queryDaily(db, { date, shift: shift === "ALL" ? undefined : shift });
      setData(result);
    })();
  }, [db, date, shift]);

  const byClas = data?.aggs.byClasificacion ?? [];
  const byGroup = data?.aggs.byScrapGroup ?? [];
  const totalScrap = data?.aggs.totalScrap ?? 0;

  const topItems: TopItem[] = useMemo(() => {
    const src = data?.aggs.topEspecialistas ?? [];
    return [...src]
      .map(it => ({
        especialista: String(it.especialista),
        clasificacion: String(it.clasificacion),
        qty: Number(it.qty ?? 0),
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [data]);

  const handleShiftChange = (e: SelectChangeEvent<Turno>) => {
    setShift(e.target.value as Turno);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        <Typography variant="h5">Daily – Diario</Typography>

        {/* Filtros */}
        <Card>
          <CardHeader title="Filtros" />
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ width: 250 }}>
                <DatePicker label="Día" value={dayjsDate} onChange={(d) => d && setDate(d.toDate())} />
              </Box>
              <FormControl sx={{ width: 180 }}>
                <InputLabel id="shift-label">Turno</InputLabel>
                <Select<Turno> labelId="shift-label" label="Turno" value={shift} onChange={handleShiftChange}>
                  <MenuItem value="ALL">Todos</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                </Select>
              </FormControl>


              <FilterAuto label="Supervisor"  value={fSupervisor}  onChange={setFSupervisor}  options={options.supervisors} />
              <FilterAuto label="Especialista" value={fSpecialist} onChange={setFSpecialist} options={options.specialists} />
              <FilterAuto label="Clasificación" value={fClas} onChange={setFClas} options={options.classifications} />
              <FilterAuto label="Scrap Group" value={fGroup} onChange={setFGroup} options={options.groups} />
              <FilterAuto label="Estación"     value={fStation} onChange={setFStation} options={options.stations} />


            </Stack>
          </CardContent>
        </Card>


        {/* Yield (debajo de filtros) */}
        <Card sx={cardSx}>
          <CardHeader title="Totales / Yield" sx={headerSx} />
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Typography>Scrap total: <b>{totalScrap}</b></Typography>
              <TextField
                type="number"
                label="Confirmadas"
                value={confirmadasStr}
                onChange={(e) => setConfirmadasStr(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                sx={{ width: 180 }}
              />
              <Typography>Yield Loss total: <b>{yieldTotal.toFixed(2)}%</b></Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Yield por Clasificación</Typography>
            <ul style={{ margin: 0 }}>
              {yieldByClas.map(r => (
                <li key={r.key}>
                  {r.key}: {r.yieldPct.toFixed(2)}% (scrap {r.cantidad})
                </li>
              ))}
            </ul>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Yield por Scrap Group</Typography>
            <ul style={{ margin: 0 }}>
              {yieldByGroup.map(r => (
                <li key={r.key}>
                  {r.key}: {r.yieldPct.toFixed(2)}% (scrap {r.cantidad})
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Clasificación */}
        <DailyChart
          title="Scrap por Clasificación"
          rows={filteredRows}
          groupBy="classification"
          colorBy={(label) => CLASS_COLORS[label] ?? "#1565C0"}
          onBarClick={({ group }) => openDetail(`Detalle • Clasificación: ${group}`, mapClas[group] ?? [])}
        />

        {/* Scrap Group (entre clasificación y estación) */}
        <DailyChart
          title="Scrap por Scrap Group"
          rows={filteredRows}
          groupBy="scrapGroup"
          colorBy={(label) => colorHash(label, GROUP_PALETTE)}
          onBarClick={({ group }) => openDetail(`Detalle • Scrap Group: ${group}`, mapGroup[group] ?? [])}
        />

        {/* Estación */}
        <DailyChart
          title="Scrap por Estación"
          rows={filteredRows}
          groupBy="station"
          colorBy={(label) => colorHash(label, GROUP_PALETTE)}
          onBarClick={({ group }) => openDetail(`Detalle • Estación: ${group}`, mapStation[group] ?? [])}
        />

        {/* Supervisor */}
        <DailyChart
          title="Scrap por Supervisor"
          rows={filteredRows}
          groupBy="supervisor"
          colorBy={(label) => colorHash(label, SUPERVISOR_PALETTE)}
          onBarClick={({ group }) => openDetail(`Detalle • Supervisor: ${group}`, mapSup[group] ?? [])}
        />

        {/* Top especialistas (vertical/columnas) */}
        <TopSpecialistsChart
          items={topItems}
          onBarClick={(esp) => openDetail(`Detalle • Especialista: ${esp}`, mapSpec[esp] ?? [])}
          colorBy={(it) => CLASS_COLORS[it.clasificacion ?? "Not defined"] ?? "#1565C0"}
        />
      </Stack>

      {/* Modal de detalles (agrupado por Supervisor) */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          {detailTitle}
          <IconButton aria-label="close" onClick={() => setDetailOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
    {/* =============== Modal de detalles =============== */}
<Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
  <DialogTitle sx={{ pr: 6 }}>
    {detailTitle}
    <IconButton
      aria-label="close"
      onClick={() => setDetailOpen(false)}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  {/* Dentro de <DialogContent dividers> … */}
  <DialogContent dividers>
    <Stack spacing={1} sx={{ mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Registros: <b>{detailRows.length}</b> — Unidades:{" "}
        <b>{detailRows.reduce((a, r) => a + (Number(r.units) || 0), 0)}</b>
      </Typography>
    </Stack>

    {/* Contenedor con altura limitada + scroll y stickyHeader */}
    <Box sx={{ maxHeight: 560, overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Supervisor / Especialistas</TableCell>
            <TableCell>Clasificación</TableCell>
            <TableCell>Scrap Group</TableCell>
            <TableCell>Estación</TableCell>
            <TableCell align="right">Unidades</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Object.entries(
            detailRows.reduce((acc, r) => {
              const sup = r.supervisor ?? "N/D";
              (acc[sup] ??= []).push(r);
              return acc;
            }, {} as Record<string, ScrapRow[]>)
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sup, rows]) => (
              <SupervisorRow key={sup} supervisor={sup} rows={rows} />
            ))}
        </TableBody>
      </Table>
    </Box>
  </DialogContent>
</Dialog>

      </Dialog>

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
                    {byClas.map((e: { clasificacion: string }, i: number) => (
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

        {/* Top de Especialistas */}
        <Card>
          <CardHeader title="Top de Especialistas (Top 10)" />
          <CardContent>
            {topItems.length === 0 ? (
              <Typography variant="body2">Sin datos para el día/turno seleccionados.</Typography>
            ) : (
              <Box sx={{ height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={topItems} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
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

        {/* Totales */}
        <Card>
          <CardHeader title="Totales del día" />
          <CardContent>
            <Typography>Scrap total: <b>{totalScrap}</b></Typography>
          </CardContent>
        </Card>
      </Stack>

    </LocalizationProvider>
  );
}
