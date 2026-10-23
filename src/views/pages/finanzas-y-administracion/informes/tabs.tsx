"use client";

import { useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Tab, Tabs } from "@mui/material";

import type { IReportFilters, ReportTab } from "@/types/pages/reports";
import { buildReportSearchParams, switchReportFilters } from "@/utils/reports/params";
import { getDefaultReportForTab } from "@/utils/reports/registry";

interface Props {
  tab: ReportTab;
  filters: IReportFilters;
}

export default function ReportTabs({ tab, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleChange = (_event: React.SyntheticEvent, value: ReportTab) => {
    const target = getDefaultReportForTab(value);
    const nextFilters = switchReportFilters(filters, target);
    const params = buildReportSearchParams({ tab: target.tab, report: target, filters: nextFilters });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Tabs
      value={tab}
      onChange={handleChange}
      variant='scrollable'
      allowScrollButtonsMobile
      sx={{ borderBottom: 1, borderColor: "divider" }}
      aria-label='Informes de producción y ventas'
    >
      <Tab label='Producción' value='produccion' />
      <Tab label='Ventas' value='ventas' disabled />
    </Tabs>
  );
}
