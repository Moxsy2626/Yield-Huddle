// src/features/daily/data/queries/DailyService.mock.ts
import type { IDailyService } from "../../ports/IDailyService";
import type { DailyResult } from "../../ports/types";

// Puedes reemplazar esto con tu mock real
const MOCK: DailyResult = {
  rows: [
    // ... agrega aquí tus filas para pruebas
  ]
};

export const DailyServiceMockAdapter: IDailyService = {
  async queryDaily(_p) {
    // Simula latencia si quieres:
    // await new Promise(r => setTimeout(r, 200));
    return MOCK;
  }
};
