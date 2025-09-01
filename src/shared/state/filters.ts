import { useMemo } from 'react';
import dayjs from 'dayjs';

export type Filters = {
  date: string;     // YYYY-MM-DD
  shift?: 'A' | 'B';
};

export function useFilters(): Filters {
  // Semilla básica: fecha de hoy
  const date = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  return { date };
}
