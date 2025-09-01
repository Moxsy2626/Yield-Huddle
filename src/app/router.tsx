import { createBrowserRouter } from 'react-router-dom';
import AppShell from './AppShell';
import ROUTES from './routes';

// Puedes cambiar a createHashRouter si lo usas con Tauri
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: ROUTES[0].element }, // Diario
      ...ROUTES.slice(1).map(r => ({ path: r.path.replace(/^\//, ''), element: r.element })),
      { path: '*', element: <div style={{ padding: 24 }}>No encontrado</div> },
    ],
  },
]);

export default router;
