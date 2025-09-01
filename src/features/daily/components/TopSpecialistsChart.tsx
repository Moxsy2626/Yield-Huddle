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
