// + nuevo tipo para el detalle de cada unidad
export type UnitDetail = {
  id: string;               // identificador único (folio/serial)
  timestamp?: string;       // ISO o hh:mm
  comment?: string;         // nota / causa / acción
  station?: string;         // estación real donde ocurrió
  specialist?: string;      // quién registró
};

// Clase base de fila
export class ScrapRow {
  id: string | number;
  supervisor?: string;
  classification?: string;
  station?: string;
  scrapGroup?: string;
  specialist?: string;
  units: number;
  date?: string;            // "YYYY-MM-DD"
  shift?: "A" | "B" | "C";

  // + nuevo: arreglo con el detalle por unidad
  unitDetails?: UnitDetail[];

  constructor(params: Partial<ScrapRow> & { id: string | number; units: number }) {
    Object.assign(this, params);
  }
}
