import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell'
import { ROUTES } from './routes'
import NotFound from '../shared/NotFound'   // usa relativo si el alias @ aún no está

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: ROUTES.map(r => ({ path: r.path, element: r.element })),
  },
  { path: '*', element: <NotFound /> },
])
