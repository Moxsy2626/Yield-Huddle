import { useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader,
  FormControl, InputLabel, Select, MenuItem, Stack
} from "@mui/material";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

type Item = { especialista: string; qty: number; clasificacion: string };

export default function TopSpecialistsChart({ data }: { data: Item[] }) {
  const [cls, setCls] = useState<string>("ALL");

  const options = useMemo(() => {
    const s = new Set<string>();
    data.forEach(d => s.add(d.clasificacion));
    return ["ALL", ...Array.from(s)];
  }, [data]);

  const filtered = useMemo(() => {
    const rows = cls === "ALL" ? data : data.filter(d => d.clasificacion === cls);
    return [...rows].sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [data, cls]);

  return (
    <Card>
      <CardHeader title="Top Especialistas" />
      <CardContent>
        <Stack spacing={2}>
          <FormControl sx={{ width: 240 }}>
            <InputLabel id="cls-label">Clasificación</InputLabel>
            <Select labelId="cls-label" label="Clasificación" value={cls} onChange={(e) => setCls(String(e.target.value))}>
              {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>

          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={filtered} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="especialista" />
                <Tooltip />
                <Bar dataKey="qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
