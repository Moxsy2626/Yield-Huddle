// src/features/daily/ports/IDailyService.ts
import type { DailyResult } from "../ports/types";

export interface IDailyService {
  queryDaily: (p: { date: Date; shift?: "A" | "B" | "C" }) => Promise<DailyResult>;
}
