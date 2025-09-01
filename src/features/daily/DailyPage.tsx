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
