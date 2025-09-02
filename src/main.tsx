import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider, CircularProgress, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es"; // opcional: español

import { router } from "@/app/router";
import { theme } from "@/shared/theme";
import { initDb } from "@/data/sqlite";

const Bootstrap: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDb();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Bootstrap />
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
