// src/pages/DailyPage.tsx
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

import { useFiltersStore, type Turno } from "../store/filters";
import { queryDaily } from "../data/queries/queryDaily";
import type { DailyResult, HierNode } from "../data/queries/queryDaily";
import { loadDb, type SQLDatabase } from "../data/sqlite";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";

type TreeRow = { key: string; label: string; qty?: number; level: number; parent?: string };

const CLASS_COLORS: Record<string, string> = {
  Handling: "#6aa84f",
  Workmanship: "#3c78d8",
  Technical: "#cc0000",
  Training: "#f1c232",
  "Not defined": "#999999",
};

export default function DailyPage() {
  // filtros globales
  const date = useFiltersStore((s) => s.date);
  const shift = useFiltersStore((s) => s.shift);
  const setDate = useFiltersStore((s) => s.setDate);
  const setShift = useFiltersStore((s) => s.setShift);
  const dayjsDate = useMemo<Dayjs>(() => dayjs(date), [date]);

  // estado local
  const [db, setDb] = useState<SQLDatabase | null>(null);
  const [data, setData] = useState<DailyResult | null>(null);
  const [flatRows, setFlatRows] = useState<TreeRow[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // cargar DB con seed
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (db) return;
      const database = await loadDb();
      if (!cancelled) setDb(database);
    })();
    return () => { cancelled = true; };
  }, [db]);

  // ejecutar consulta
  useEffect(() => {
    if (!db) return;
    (async () => {
      const result = await queryDaily(db, { date, shift: shift === "ALL" ? undefined : shift });
      setData(result);
    })();
  }, [db, date, shift]);

  // aplanar jerarquía
  useEffect(() => {
    if (!data) { setFlatRows([]); return; }
    const rows: TreeRow[] = [];
    const walk = (node: HierNode, level: number, parent?: string) => {
      rows.push({ key: node.key, label: node.label, qty: node.qty, level, parent });
      (node.children ?? []).forEach((ch: HierNode) => walk(ch, level + 1, node.key));
    };
    data.hierarchy.forEach((root) => walk(root, 0));
    setFlatRows(rows);
  }, [data]);

  // expandir niveles 0–1
  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const r of flatRows) if (r.level <= 1) init[r.key] = true;
    setExpanded(init);
  }, [flatRows]);

  const visibleRows = useMemo(() => {
    const findRow = (k: string) => flatRows.find((r) => r.key === k)!;
    const canShow = (row: TreeRow): boolean =>
      !row.parent || (expanded[row.parent] && canShow(findRow(row.parent)));
    return flatRows.filter(canShow);
  }, [flatRows, expanded]);

  // gráficos
  const byClas = data?.aggs.byClasificacion ?? [];
  const byGroup = data?.aggs.byScrapGroup ?? [];
  const totalScrap = data?.aggs.totalScrap ?? 0;

  // handler tipado para el select
  const handleShiftChange = (e: SelectChangeEvent<Turno>) => {
    setShift(e.target.value as Turno);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} p={2}>
        <Typography variant="h5">Daily – Diario</Typography>

        {/* Filtros */}
        <Card>
          <CardHeader title="Filtros" />
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 250 }}>
                <DatePicker
                  label="Día"
                  value={dayjsDate}
                  onChange={(d) => d && setDate(d.toDate())}
                />
              </Box>
              <FormControl sx={{ width: 180 }}>
                <InputLabel id="shift-label">Turno</InputLabel>
                <Select<Turno>
                  labelId="shift-label"
                  label="Turno"
                  value={shift}
                  onChange={handleShiftChange}
                >
                  <MenuItem value="ALL">Todos</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabla jerárquica */}
        <Card>
          <CardHeader title="Tabla jerárquica (Supervisor → Clasificación → Estación → Scrap Group → Hallazgo → Especialista)" />
          <CardContent>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 1, alignItems: "center" }}>
              <Box sx={{ fontWeight: 600 }}>Nodo</Box>
              <Box sx={{ fontWeight: 600, textAlign: "right" }}>Cantidad</Box>

              {visibleRows.map((row) => {
                const hasChildren = flatRows.some((r) => r.parent === row.key);
                return (
                  <Box key={row.key} sx={{ gridColumn: "1 / span 2", display: "contents" }}>
                    <Box
                      onClick={() => hasChildren && setExpanded((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
                      sx={{
                        pl: row.level * 2,
                        cursor: hasChildren ? "pointer" : "default",
                        userSelect: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {hasChildren ? (expanded[row.key] ? "▼ " : "► ") : "• "}
                      {row.label}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>{row.qty ?? ""}</Box>
                  </Box>
                );
              })}
            </Box>
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
                    {byClas.map((e: { clasificacion: string }, i: number) => (
                      <Cell key={`c-${i}`} fill={CLASS_COLORS[e.clasificacion] ?? "#888"} />
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

        {/* Totales del día */}
        <Card>
          <CardHeader title="Totales del día" />
          <CardContent>
            <Typography variant="body1">Scrap total: <b>{totalScrap}</b></Typography>
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}
