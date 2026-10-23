"use client";

import { useState } from "react";

import { Button, CircularProgress, Stack } from "@mui/material";
import toast from "react-hot-toast";

import { exportReport, type ExportFormat } from "@/api/reports";
import type { IReportFilters } from "@/types/pages/reports";

interface Props {
  reportKey: string;
  filters: IReportFilters;
  disabled?: boolean;
}

export default function ExportButtons({ reportKey, filters, disabled = false }: Props) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);

    try {
      await exportReport(reportKey, filters, format);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el reporte.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Stack direction='row' spacing={1}>
      {(["xlsx", "csv"] as const).map(format => (
        <Button
          key={format}
          size='small'
          variant='outlined'
          disabled={disabled || loading !== null}
          onClick={() => handleExport(format)}
          startIcon={loading === format ? <CircularProgress size={14} color='inherit' /> : undefined}
        >
          {format.toUpperCase()}
        </Button>
      ))}
    </Stack>
  );
}
