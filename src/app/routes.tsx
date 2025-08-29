import type { ReactNode } from 'react'
import TodayIcon from '@mui/icons-material/Today'
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'

import DailyPage from '@/features/daily'
import WeeklyPage from '@/features/weekly'
import MonthlyPage from '@/features/monthly'
import MinutesPage from '@/modules/minutes'
import UndefinedUnitsPage from '@/modules/undefined'

export type AppRoute = {
  path: string
  title: string
  element: ReactNode
  icon?: ReactNode
  drawer?: boolean
}

export const ROUTES: AppRoute[] = [
  { path: '/',            title: 'Diario',           element: <DailyPage />,          icon: <TodayIcon />,             drawer: true },
  { path: '/semanal',     title: 'Semanal',          element: <WeeklyPage />,         icon: <CalendarViewWeekIcon />,  drawer: true },
  { path: '/mensual',     title: 'Mensual',          element: <MonthlyPage />,        icon: <CalendarMonthIcon />,     drawer: true },
  { path: '/minuta',      title: 'Minuta',           element: <MinutesPage />,        icon: <ListAltIcon />,           drawer: true },
  { path: '/sin-clasif',  title: 'Sin clasificación',element: <UndefinedUnitsPage />, icon: <ReportProblemIcon />,     drawer: true },
]
