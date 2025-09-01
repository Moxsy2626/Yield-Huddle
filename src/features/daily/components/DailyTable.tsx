import * as React from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { ScrapEntry } from "@/entities/scrap";

interface Props {
  rows: ScrapEntry[];
}

const columns: GridColDef<ScrapEntry>[] = [
  { field: "id", headerName: "#", width: 70 },
  { field: "scrapGroup", headerName: "Grupo", flex: 1, minWidth: 120 },
  { field: "classification", headerName: "Clasificación", flex: 1, minWidth: 150 },
  { field: "supervisor", headerName: "Supervisor", flex: 1, minWidth: 120 },
  { field: "specialist", headerName: "Especialista", flex: 1, minWidth: 120 },
  { field: "units", headerName: "Unidades", type: "number", width: 110 },
];

export default function DailyTable({ rows }: Props) {
  return (
    <div style={{ height: 420, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}               // asegura ID estable
        disableRowSelectionOnClick            // UX: evita selección accidental
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 10 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        density="compact"
      />
    </div>
  );
}
