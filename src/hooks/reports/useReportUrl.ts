"use client";

import { useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";

import type { IReportFilters } from "@/types/pages/reports";
import type { ReportEntry } from "@/utils/reports/registry";
import { buildReportSearchParams } from "@/utils/reports/params";

export function useReportUrl(report: ReportEntry, filters: IReportFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const update = (patch: Partial<IReportFilters>) => {
    const next = { ...filters, ...patch };
    const params = buildReportSearchParams({ tab: report.tab, report, filters: next });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return { update, isPending };
}
