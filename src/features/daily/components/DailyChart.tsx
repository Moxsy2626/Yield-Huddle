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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
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
  );
}
