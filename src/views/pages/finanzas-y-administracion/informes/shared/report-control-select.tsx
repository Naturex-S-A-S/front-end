"use client";

import { MenuItem, TextField } from "@mui/material";

interface Props {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string) => void;
}

export default function ReportControlSelect({ label, value, options, onChange }: Props) {
  return (
    <TextField
      select
      size='small'
      label={label}
      value={value}
      onChange={event => onChange(event.target.value)}
      sx={{ minWidth: 140 }}
    >
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
