import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from './routes'
import {
  AppBar, Toolbar, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  CssBaseline, Box, Typography
} from '@mui/material'
import { useEffect } from 'react';


const drawerWidth = 260

export default function AppShell() {
  const { pathname } = useLocation()
useEffect(() => {
    // Crea datos iniciales solo si la DB está vacía

  }, []);
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Yield Huddle
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {ROUTES.filter(r => r.drawer).map((r) => {
            const selected = pathname === r.path
            return (
              <ListItemButton key={r.path} component={Link} to={r.path} selected={selected}>
                {r.icon && <ListItemIcon>{r.icon}</ListItemIcon>}
                <ListItemText primary={r.title} />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
