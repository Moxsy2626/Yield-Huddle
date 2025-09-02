// src/features/daily/components/details/SupervisorRow.tsx
import React, { useMemo, useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Chip,
  Table,
  TableHead,
  TableBody,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { ScrapRow } from "@/features/daily/ports/types";

interface Props {
  supervisor: string;
  rows: ScrapRow[];
}

export const SupervisorRow: React.FC<Props> = ({ supervisor, rows }) => {
  // ⬅️ siempre arrancar colapsado
  const [open, setOpen] = useState(false);

  const total = useMemo(
    () => rows.reduce((a, r) => a + (Number(r.units) || 0), 0),
    [rows]
  );

  // puedes agrupar por especialista si así lo tenías:
  const bySpecialist = useMemo(() => {
    const map = new Map<string, ScrapRow[]>();
    for (const r of rows) {
      const key = r.specialist ?? "Especialista";
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return Array.from(map.entries()).map(([key, list]) => ({
      specialist: key,
      rows: list,
      units: list.reduce((a, r) => a + (Number(r.units) || 0), 0),
      clasificacion: list[0]?.classification ?? "Not defined",
      scrapGroup: list[0]?.scrapGroup ?? "Not defined",
      station: list[0]?.station ?? "N/D",
    }));
  }, [rows]);

  return (
    <>
      {/* Fila encabezado del supervisor */}
      <TableRow sx={{ backgroundColor: "action.hover" }}>
        <TableCell width={48}>
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Contraer" : "Expandir"}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={4}>
          <Typography fontWeight={700}>{supervisor}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight={700}>Total: {total}</Typography>
        </TableCell>
      </TableRow>

      {/* Detalle colapsable */}
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={48} />
                    <TableCell>Especialista</TableCell>
                    <TableCell>Clasificación</TableCell>
                    <TableCell>Scrap Group</TableCell>
                    <TableCell>Estación</TableCell>
                    <TableCell align="right">Unidades</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bySpecialist.map((s) => (
                    <TableRow key={s.specialist}>
                      <TableCell />
                      <TableCell>{s.specialist}</TableCell>
                      <TableCell>
                        <Chip size="small" label={s.clasificacion} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={s.scrapGroup} />
                      </TableCell>
                      <TableCell>{s.station}</TableCell>
                      <TableCell align="right">{s.units}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
