<<<<<<< HEAD
export default function DailyPage() { return <h2>Dashboard Diario</h2> }
=======
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
  },
  shape: { borderRadius: 10 },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
>>>>>>> bbeff7aa87bc1a5e13421671f4fbc480de4b59ee
