// src/shared/theme.ts
import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e88e5" },
    secondary: { main: "#8e24aa" },
    success: { main: "#2e7d32" },
    warning: { main: "#f57c00" },
    error: { main: "#d32f2f" },
    info: { main: "#0288d1" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

export default theme;
