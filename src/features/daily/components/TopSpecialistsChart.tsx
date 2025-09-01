import React from "react";
import {
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
