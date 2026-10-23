"use client";

import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths, subYears } from "date-fns";

import { Button, Stack, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import CustomDatePicker from "@/@core/components/react-datepicker";

import type { FilterFormValues } from "./types";

interface Props {
  dateLabel: string;
}

export default function DateRangeFilter({ dateLabel }: Props) {
  const { control, setValue } = useFormContext<FilterFormValues>();
  const now = new Date();

  const setRange = (from: Date, to: Date) => {
    setValue("from", from, { shouldValidate: true, shouldDirty: true });
    setValue("to", to, { shouldValidate: true, shouldDirty: true });
  };

  const shortcuts = [
    { label: "Mes actual", from: startOfMonth(now), to: now },
    { label: "Mes anterior", from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) },
    { label: "Últimos 3 meses", from: startOfMonth(subMonths(now, 2)), to: now },
    { label: "Año actual", from: startOfYear(now), to: now },
    { label: "Año anterior", from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) }
  ];

  return (
    <Stack spacing={1.5}>
      <Typography variant='caption' color='text.secondary'>
        {dateLabel}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <CustomDatePicker control={control} name='from' label='Desde' />
        <CustomDatePicker control={control} name='to' label='Hasta' />
      </Stack>
      <Stack direction='row' spacing={0.5} useFlexGap flexWrap='wrap'>
        {shortcuts.map(shortcut => (
          <Button key={shortcut.label} size='small' onClick={() => setRange(shortcut.from, shortcut.to)}>
            {shortcut.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
