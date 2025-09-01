import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ScrapEntry } from '@/entities/scrap';

interface Props {
  rows: ScrapEntry[];
}

export default function DailyChart({ rows }: Props) {
  const data = React.useMemo(() => {
    // Agregar unidades por clasificación
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.classification, (map.get(r.classification) ?? 0) + r.units);
    }
    return Array.from(map.entries()).map(([classification, units]) => ({
      classification,
      units,
    }));
  }, [rows]);

  return (
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
