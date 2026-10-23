"use client";

import { useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import type { IReportFilters, ReportKey } from "@/types/pages/reports";
import { buildReportSearchParams, switchReportFilters } from "@/utils/reports/params";
import { REPORTS, REPORTS_BY_TAB, type ReportEntry } from "@/utils/reports/registry";

interface Props {
  report: ReportEntry;
  filters: IReportFilters;
}

export default function ReportSelector({ report, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, value: ReportKey | null) => {
    if (!value || value === report.key) return;

    const target = REPORTS[value];
    const nextFilters = switchReportFilters(filters, target);
    const params = buildReportSearchParams({ tab: target.tab, report: target, filters: nextFilters });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={report.key}
      onChange={handleChange}
      aria-label='Seleccionar reporte'
      sx={{
        width: { xs: "100%", sm: "auto" },
        flexWrap: "wrap",
        "& .MuiToggleButton-root": { flex: { xs: "1 1 45%", sm: "initial" }, textTransform: "none" }
      }}
    >
      {REPORTS_BY_TAB[report.tab].map(entry => (
        <ToggleButton key={entry.key} value={entry.key} style={{ display: entry.disabled ? 'none' : 'flex' }}>
          {entry.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
