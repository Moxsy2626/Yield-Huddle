// src/features/daily/components/DailyChart.tsx
import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
=======
import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,

  LabelList,
} from "recharts";
import {
  Card,
  CardHeader,
  CardContent,
  alpha,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
} from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";

import type { ScrapRow } from "@/domain/entities/ScrapRow";
=======
} from "recharts";

import type { ScrapRow } from "@/domain/entities/ScrapRow";

type GroupBy =
  | "classification"
  | "scrapGroup"
  | "station"
  | "supervisor"
  | "specialist";

type Aggregated = { label: string; cantidad: number };

interface Props {
  /** Título que sale en el CardHeader */
  title: string;
  /** Filas base (sin filtrar o ya filtradas por la página) */
  rows: ScrapRow[];
  /** Campo por el que se agrupa el gráfico */
  groupBy: GroupBy;
  /**
   * Callback opcional para colorizar cada barra.
   * Recibe el label (valor del grupo) y retorna el color.
   */
  colorBy?: (label: string) => string;
  /**
   * Click en una barra; entrega el grupo y los registros que lo componen.
   */
  onBarClick?: (p: { group: string; rows: ScrapRow[] }) => void;
  /** Alto del gráfico (px) */
  height?: number;
}

const tooltipFormatter = (value: number) => [value, "Cantidad"];

export default function DailyChart({
  title,
  rows,
  groupBy,
  colorBy,
  onBarClick,
  height = 280,
}: Props) {
  const theme = useTheme();

  // Mapear el campo seleccionado a un string consistente
  const pick = (r: ScrapRow): string => {
    switch (groupBy) {
      case "classification":
        return r.classification ?? "Not defined";
      case "scrapGroup":
        return r.scrapGroup ?? "Not defined";
      case "station":
        return r.station ?? "N/D";
      case "supervisor":
        return r.supervisor ?? "N/D";
      case "specialist":
        return r.specialist ?? "N/D";
      default:
        return "N/D";
    }
  };

  // Agrupar -> { label, cantidad } y también guardar referencias por grupo
  const { data, byGroup } = useMemo(() => {
    const mapRows: Record<string, ScrapRow[]> = {};
    const mapCount: Record<string, number> = {};
    for (const r of rows) {
      const key = pick(r);
      (mapRows[key] ??= []).push(r);
      mapCount[key] = (mapCount[key] ?? 0) + (r.units || 0);
    }
    const arr: Aggregated[] = Object.entries(mapCount).map(([label, cantidad]) => ({
      label,
      cantidad,
    }));
    // Orden descendente por cantidad
    arr.sort((a, b) => b.cantidad - a.cantidad);
    return { data: arr, byGroup: mapRows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, groupBy]); // solo cambia cuando cambian filas o el campo de agrupación

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={title}
        sx={{
          pb: 0,
          background: `linear-gradient(180deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, transparent)`,
        }}
      />
      <CardContent>
        <Box sx={{ height }}>
          <ResponsiveContainer>
            <BarChart data={data} barCategoryGap={26}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Bar
                dataKey="cantidad"
                isAnimationActive={false} // sin animación
                cursor={onBarClick ? "pointer" : "default"}
                onClick={
                  onBarClick
                    ? (d: any) => {
                        const group = String(d?.payload?.label ?? "");
                        onBarClick({ group, rows: byGroup[group] ?? [] });
                      }
                    : undefined
                }
                fill={alpha(theme.palette.primary.main, 0.85)} // fallback (nunca negro)
              >
                {colorBy
                  ? data.map((d, i) => (
                      <Cell key={i} fill={colorBy(d.label)} />
                    ))
                  : null}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>

} from 'recharts';
import type { ScrapEntry } from '@/entities/scrap';


interface Props {
  title: string;
  rows: ScrapRow[];
  /** "classification" | "scrapGroup" | "station" | "supervisor" | "specialist" */
  groupBy: keyof ScrapRow;
  height?: number;
  colorBy?: (label: string) => string;
  onBarClick?: (params: { group: string }) => void;
}

export default function DailyChart({
  title,
  rows,
  groupBy,
  height = 300,
  colorBy,
  onBarClick,
}: Props) {
  const theme = useTheme();
  const isSpecialist = groupBy === "specialist";
  const [open, setOpen] = React.useState(false);

  // ======== Aggregation ========
  const data = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = String(r[groupBy] ?? "Not defined");
      map.set(key, (map.get(key) ?? 0) + (Number(r.units) || 0));
    }

    // generar arreglo y ordenar DESC por valor
    let arr = Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      fill: colorBy ? colorBy(name) : theme.palette.primary.main,
    }));

    arr = arr.sort((a, b) => b.value - a.value);

    return arr;
  }, [rows, groupBy, colorBy, theme]);

  // ======== Tooltip personalizado ========
  const TooltipBox = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${alpha(theme.palette.common.black, 0.15)}`,
          borderRadius: 8,
          padding: "8px 10px",
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          maxWidth: 360,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div>
          <b>Cantidad:</b> {payload[0].value}
        </div>
      </div>
    );
  };

  // ======== Render de gráfico (reutilizable para card y modal) ========
  const renderChart = (h: number) => (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: isSpecialist ? 110 : 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          interval={0} // siempre todas las etiquetas
          angle={isSpecialist ? -90 : 0}
          textAnchor={isSpecialist ? "end" : "middle"}
          height={isSpecialist ? 130 : 40}
          tick={{
            fontSize: 12,
            fill: theme.palette.text.primary,
            fontWeight: isSpecialist ? 600 : 400,
            whiteSpace: "pre-wrap",
          }}
        />
        <YAxis />
        <Tooltip content={<TooltipBox />} />
        <Bar
          dataKey="value"
          isAnimationActive={false}
          cursor={onBarClick ? "pointer" : "default"}
          onClick={(d: any) => onBarClick?.({ group: d?.name as string })}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill as string} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            style={{ fontSize: 12, fontWeight: 600, fill: "#333" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (

    <>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
          overflow: "hidden",
        }}
      >
        <CardHeader
          title={title}
          action={
            <IconButton aria-label="expand" onClick={() => setOpen(true)} size="small">
              <OpenInFullIcon />
            </IconButton>
          }
          sx={{
            pb: 0,
            background: `linear-gradient(180deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )}, transparent)`,
          }}
        />
        <CardContent>{renderChart(height)}</CardContent>
      </Card>

      {/* Modal ampliado */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xl">
        <DialogTitle sx={{ pr: 6 }}>
          {title}
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: "70vh" }}>{renderChart(/* alto modal */  "100%" as any)}</Box>
        </DialogContent>
      </Dialog>
    </>

    <div style={{ height: 280, width: '100%' }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="classification" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="units" />
        </BarChart>
      </ResponsiveContainer>
    </div>


  );
}
