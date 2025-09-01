import * as React from "react";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Stack, Box, Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";    

// Tipo base (me adapto a tus filas actuales de DailyTable) :contentReference[oaicite:0]{index=0}
export type ScrapRow = {
  id: string | number;
  scrapGroup?: string;
  classification?: string;
  supervisor?: string;
  specialist?: string;
  station?: string;          // si viene
  units: number;
  [k: string]: any;
};

type Props = {
  rows: ScrapRow[];
};

/** 
 * Agrupo en 5 niveles: Supervisor → Clasificación → Estación → Scrap Group → Especialista.
 * En cada nodo muestro suma de "units".
 * Uso Accordions anidados para evitar DataGrid Pro y cumplir la jerarquía requerida.
 */
export default function GroupedDailyTable({ rows }: Props) {
  // Helper para sumar unidades
  const sum = (arr: ScrapRow[]) => arr.reduce((a, r) => a + (Number(r.units) || 0), 0);

  // 1) Agrupar por supervisor
  const bySupervisor = React.useMemo(() => {
    const map = new Map<string, ScrapRow[]>();
    for (const r of rows) {
      const key = r.supervisor ?? "N/D";
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return Array.from(map.entries());
  }, [rows]);

  return (
    <Stack spacing={1}>
      {bySupervisor.map(([supervisor, rowsSup]) => {
        const totalSup = sum(rowsSup);

        // 2) Agrupar por clasificación dentro del supervisor
        const byClas = groupBy(rowsSup, (r) => r.classification ?? "Not defined");

        return (
          <Accordion key={supervisor} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                Supervisor: {supervisor} — Total: {totalSup}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {byClas.map(([clas, rowsClas]) => {
                  const totalClas = sum(rowsClas);

                  // 3) Agrupar por estación
                  const byStation = groupBy(rowsClas, (r) => r.station ?? "N/D");

                  return (
                    <Accordion key={`${supervisor}-${clas}`} disableGutters>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>
                          Clasificación: {clas} — Total: {totalClas}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {byStation.map(([station, rowsStation]) => {
                            const totalStation = sum(rowsStation);

                            // 4) Agrupar por scrap group
                            const byGroup = groupBy(rowsStation, (r) => r.scrapGroup ?? "N/D");

                            return (
                              <Accordion key={`${supervisor}-${clas}-${station}`} disableGutters>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    Estación: {station} — Total: {totalStation}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Stack spacing={1}>
                                    {byGroup.map(([group, rowsGroup]) => {
                                      const totalGroup = sum(rowsGroup);

                                      // 5) Lista final por especialista (hojas)
                                      const byEspecialista = groupBy(rowsGroup, (r) => r.specialist ?? "N/D");

                                      return (
                                        <Accordion key={`${supervisor}-${clas}-${station}-${group}`} disableGutters>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: 600 }}>
                                              Scrap Group: {group} — Total: {totalGroup}
                                            </Typography>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                            <Stack spacing={0.5}>
                                              {byEspecialista.map(([esp, rowsEsp]) => (
                                                <Box
                                                  key={`${supervisor}-${clas}-${station}-${group}-${esp}`}
                                                  sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    bgcolor: "action.hover",
                                                  }}
                                                >
                                                  <Typography>Especialista: {esp}</Typography>
                                                  <Typography fontWeight={600}>
                                                    {sum(rowsEsp)}
                                                  </Typography>
                                                </Box>
                                              ))}
                                              <Divider sx={{ my: 1 }} />
                                              <Typography variant="body2" color="text.secondary">
                                                Total {group}: {totalGroup}
                                              </Typography>
                                            </Stack>
                                          </AccordionDetails>
                                        </Accordion>
                                      );
                                    })}
                                  </Stack>
                                </AccordionDetails>
                              </Accordion>
                            );
                          })}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {bySupervisor.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Sin registros para los filtros seleccionados.
        </Typography>
      )}
    </Stack>
  );
}

// Utilidad local para agrupar
function groupBy<T>(arr: T[], getKey: (t: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = getKey(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return Array.from(map.entries());
}
