import React, { useState } from "react";
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
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { ScrapRow } from "../../ports/types";

export const RowWithUnitDetails: React.FC<{ row: ScrapRow }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  const details = row.unitDetails ?? [];
  const theme = useTheme();

  return (
    <>
      {/* Fila principal */}
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

        <TableCell sx={{ fontWeight: 600 }}>
          {row.specialist ?? "N/D"}
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={row.classification ?? "Not defined"}
            sx={{ bgcolor: alpha(theme.palette.success.main, 0.12) }}
          />
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={row.scrapGroup ?? "Not defined"}
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12) }}
          />
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={row.station ?? "N/D"}
            sx={{ bgcolor: alpha(theme.palette.info.main, 0.12) }}
          />
        </TableCell>

        <TableCell align="right" sx={{ fontWeight: 700 }}>
          {row.units}
        </TableCell>
      </TableRow>

      {/* Detalle de unidades */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: 0,
                p: 2,
                bgcolor: alpha(theme.palette.background.default, 0.6),
              }}
            >
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
                    <TableRow
                      sx={{
                        "& th": {
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                        },
                      }}
                    >
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
                        sx={{
                          "&:nth-of-type(odd)": {
                            bgcolor: alpha(theme.palette.action.hover, 0.3),
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {d.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {d.timestamp ?? "-"}
                        </TableCell>
                        {/* Usa el scrapGroup inyectado en los detalles; si no viene, cae al del row */}
                        <TableCell>
                          {(d as any).scrapGroup ?? row.scrapGroup ?? "Not defined"}
                        </TableCell>
                        <TableCell>{d.station ?? row.station ?? "-"}</TableCell>
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
