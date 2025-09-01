// src/features/daily/components/filters/FilterAuto.tsx
import React, { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";

export function FilterAuto({
  label, value, onChange, options, width = 200,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; width?: number; }) {
  const opts = useMemo(() => ["ALL", ...options], [options]);
  return (
    <Autocomplete
      size="small"
      sx={{ width }}
      options={opts}
      value={value}
      isOptionEqualToValue={(o, v) => o === v}
      getOptionLabel={(o) => (o === "ALL" ? "Todos" : String(o))}
      onChange={(_, v) => onChange(v ?? "ALL")}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
