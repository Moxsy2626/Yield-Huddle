// src/features/daily/components/ChartCard.tsx
import React from "react";
import {
  Card, CardContent, CardHeader, Box, alpha, useTheme
} from "@mui/material";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";

type SimpleBarDatum = Record<string, any>;

export type ChartProps = {
  title: string;
  data: SimpleBarDatum[];
  xKey: string;
  yKey: string;
  onBarClick?: (d: any) => void;
  colorBy?: (d: any) => string;
};

const tooltipFormatter = (value: number) => [value, "Cantidad"];

export const ChartCard: React.FC<ChartProps> = React.memo(function ChartCard({
  title, data, xKey, yKey, onBarClick, colorBy
}) {
  const theme = useTheme();
  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
      overflow: "hidden"
    }}>
      <CardHeader
        title={title}
        sx={{ pb: 0, background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.10)}, transparent)` }}
      />
      <CardContent>
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={data} barCategoryGap={26}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Bar
                dataKey={yKey}
                onClick={onBarClick}
                cursor={onBarClick ? "pointer" : "default"}
                isAnimationActive={false}
                fill={alpha(theme.palette.primary.main, 0.85)} // fallback
              >
                {colorBy ? data.map((d, i) => <Cell key={i} fill={colorBy(d)} />) : null}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}, (prev, next) =>
  prev.title === next.title &&
  prev.xKey === next.xKey &&
  prev.yKey === next.yKey &&
  prev.onBarClick === next.onBarClick &&
  prev.data === next.data
);
