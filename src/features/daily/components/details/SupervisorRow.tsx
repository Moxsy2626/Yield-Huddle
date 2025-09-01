// src/features/daily/components/detail/SupervisorRow.tsx
import React, { useMemo, useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  alpha,
  useTheme,
  Divider,
  Chip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { ScrapRow } from "../../ports/types";

/* Utils */
const uniq = (arr: Array<string | undefined | null>) =>
  Array.from(new Set(arr.filter(Boolean) as string[]));

/** Agrupa filas por especialista y aplana unitDetails;
 *  si hay múltiples clasificaciones, muestra "Varios". */
function groupBySpecialist(rows: ScrapRow[]): ScrapRow[] {
  const map: Record<string, ScrapRow[]> = {};
  for (const r of rows) {
    const k = r.specialist ?? "N/D";
    (map[k] ??= []).push(r);
  }

  const out: ScrapRow[] = [];
  for (const [spec, list] of Object.entries(map)) {
    const units = list.reduce((a, r) => a + (Number(r.units) || 0), 0);
    const uClas = uniq(list.map((r) => r.classification));
    const unitDetails =
      list.flatMap((r) =>
        (r.unitDetails ?? []).map((d) => ({
          ...d,
          // inyectamos el scrapGroup origen para mostrarlo en el detalle
          // @ts-expect-error prop extendida para render
          scrapGroup: r.scrapGroup,
        }))
      ) ?? [];

    out.push({
      id: spec,
      specialist: spec,
      supervisor: list[0]?.supervisor,
      classification: uClas.length === 1 ? uClas[0] : "Varios",
      units,
      unitDetails,
      // (scrapGroup/station no se muestran en la fila, pero pueden variar en el detalle)
    });
  }

  out.sort((a, b) => (b.units || 0) - (a.units || 0));
  return out;
}

/** Fila compacta por especialista + detalle expandible con unidades */
const SpecialistCompactRowWithDetail: React.FC<{ row: ScrapRow }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const details = row.unitDetails ?? [];

  return (
    <>
      {/* Fila principal (solo 3 columnas) */}
      <TableRow hover>
        <TableCell width={48} padding="checkbox">
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            disabled={details.length === 0}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{row.specialist ?? "N/D"}</TableCell>
        <TableCell>
          <Chip
            size="small"
            label={row.classification ?? "Not defined"}
            sx={{ bgcolor: alpha(theme.palette.success.main, 0.12) }}
          />
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700 }}>
          {row.units}
        </TableCell>
      </TableRow>

      {/* Detalle por unidad */}
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.6) }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Detalle de unidades ({details.length})
              </Typography>

              <Box
                sx={{
                  maxHeight: 320,
                  overflow: "auto",
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: alpha(theme.palette.background.paper, 0.9) } }}>
                      <TableCell width={120}>Unidad</TableCell>
                      <TableCell width={160}>Hora</TableCell>
                      <TableCell>Scrap Group</TableCell>
                      <TableCell>Estación</TableCell>
                      <TableCell>Comentario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((d) => (
                      <TableRow
                        key={d.id}
                        sx={{ "&:nth-of-type(odd)": { bgcolor: alpha(theme.palette.action.hover, 0.3) } }}
                      >
                        <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {d.id}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {d.timestamp ?? "-"}
                        </TableCell>
                        <TableCell>{(d as any).scrapGroup ?? "Not defined"}</TableCell>
                        <TableCell>{d.station ?? "-"}</TableCell>
                        <TableCell>{d.comment ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const SupervisorRow: React.FC<{ supervisor: string; rows: ScrapRow[] }> = ({
  supervisor,
  rows,
}) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const totalUnits = rows.reduce((a, r) => a + (Number(r.units) || 0), 0);

  // Agrupar por especialista (evita duplicados)
  const grouped = useMemo(() => groupBySpecialist(rows), [rows]);

  return (
    <>
      {/* Banda de supervisor */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1,
              py: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="small" onClick={() => setOpen((o) => !o)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {supervisor}
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Total: {totalUnits}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>

      {/* Tabla compacta por especialista (3 columnas) */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Operarios / Especialistas de {supervisor}
              </Typography>

              <Box sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: alpha(theme.palette.background.paper, 0.9) } }}>
                      <TableCell width={48} />
                      <TableCell>Especialista</TableCell>
                      <TableCell>Clasificación</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grouped.map((r) => (
                      <SpecialistCompactRowWithDetail key={r.id} row={r} />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Separador */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Divider sx={{ mx: 1, my: 0.5 }} />
        </TableCell>
      </TableRow>
    </>
  );
};
