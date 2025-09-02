
import React from "react";
import {

// src/features/daily/components/TopSpecialistsChart.tsx
import React from "react";
import { Card, CardHeader, CardContent, Box, alpha, useTheme } from "@mui/material";
import {
  ResponsiveContainer,

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,

  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

type Point = { name: string; value: number };

interface Props {
  data: Point[];
  /** "vertical" = barras verticales (column chart) | "horizontal" = barras horizontales */
  orientation?: "vertical" | "horizontal";
  height?: number;
  valueLabel?: string;
  onBarClick?: (name: string) => void;
}

/**
 * TopSpecialistsChart
 * - Por defecto muestra barras VERTICALES (column chart).
 * - Si pasas orientation="horizontal" mostrará barras horizontales (útil para nombres largos).
 */
const TopSpecialistsChart: React.FC<Props> = ({
  data,
  orientation = "vertical",
  height = 320,
  valueLabel = "Cantidad",
  onBarClick,
}) => {
  const isVertical = orientation === "vertical";

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        {isVertical ? (
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v: any) => [`${v}`, valueLabel]} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              onClick={(p) => onBarClick?.(p?.name as string)}
            >
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={80} />
            <Tooltip formatter={(v: any) => [`${v}`, valueLabel]} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              onClick={(p) => onBarClick?.(p?.name as string)}
            >
              <LabelList dataKey="value" position="right" />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default TopSpecialistsChart;

  CartesianGrid,
  Cell,
} from "recharts";

export type TopItem = {
  especialista: string;
  cantidad: number;
  clasificacion?: string;
};

export function TopSpecialistsChart({
  title = "Top de Especialistas (Top 10)",
  items,
  onBarClick,
  colorBy,
  height = 340,
}: {
  title?: string;
  items: TopItem[];
  onBarClick?: (especialista: string) => void;
  colorBy?: (item: TopItem) => string;
  height?: number;
}) {
  const theme = useTheme();

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
            theme.palette.secondary.main,
            0.1
          )}, transparent)`,
        }}
      />
      <CardContent>
        {items.length === 0 ? (
          <Box sx={{ color: "text.secondary" }}>Sin datos para los filtros seleccionados.</Box>
        ) : (
          <Box sx={{ height }}>
            <ResponsiveContainer>
              <BarChart data={items} barCategoryGap={26}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="especialista" />
                <YAxis />
                <Tooltip formatter={(v) => [v as number, "Cantidad"]} />
                <Bar
                  dataKey="cantidad"
                  isAnimationActive={false}
                  cursor={onBarClick ? "pointer" : "default"}
                  onClick={
                    onBarClick
                      ? (d: any) => {
                          const key = String(d?.payload?.especialista ?? "");
                          onBarClick(key);
                        }
                      : undefined
                  }
                  fill={alpha(theme.palette.primary.main, 0.85)}
                >
                  {colorBy
                    ? items.map((it, i) => <Cell key={i} fill={colorBy(it)} />)
                    : null}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

