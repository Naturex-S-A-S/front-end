"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";

import Loader from "@/@core/components/react-spinners";
import type { IMassBalanceRow, IMassBalanceTotals, IReportFilters, IReportResult } from "@/types/pages/reports";
import { massBalanceColumns } from "@/utils/columns/reports";
import { formatKg, formatPct } from "@/utils/reports/format";

import EmptyState from "../shared/empty-state";
import ExportButtons from "../shared/export-buttons";
import MetricCards from "../shared/metric-cards";
import ReportCard from "../shared/report-card";
import ReportTable from "../shared/report-table";

const GroupedBarChart = dynamic(() => import("../charts/grouped-bar-chart"), {
  ssr: false,
  loading: () => <Loader type='component' />
});

interface Props {
  result: IReportResult<IMassBalanceRow, IMassBalanceTotals>;
  filters: IReportFilters;
}

export default function MassBalanceReport({ result, filters }: Props) {
  const empty = result.data.length === 0;
  const minLossPct = filters.minLossPct;

  const chartData = result.data.map(row => ({
    batch: row.batch,
    expected: row.expectedKg,
    produced: row.producedKg,
    loss: row.lossKg
  }));

  return (
    <ReportCard
      title='Balance de masa y rendimiento'
      warnings={result.warnings}
      actions={<ExportButtons reportKey='production-mass-balance' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:target", label: "Teórico", value: `${formatKg(result.totals.expectedKg)} kg` },
          { icon: "mdi:package-variant-closed", label: "Envasado", value: `${formatKg(result.totals.producedKg)} kg` },
          { icon: "mdi:trending-down", label: "Merma", value: formatKg(result.totals.lossKg) },
          { icon: "mdi:percent-outline", label: "% merma ponderado", value: formatPct(result.totals.lossPct) },
          { icon: "mdi:clipboard-check-outline", label: "Órdenes cerradas", value: String(result.totals.orders) }
        ]}
      />
      {empty ? (
        <EmptyState />
      ) : (
        <Stack spacing={3}>
          <GroupedBarChart data={chartData} valueFormatter={formatKg} />
          <ReportTable
            rows={result.data}
            columns={massBalanceColumns()}
            totals={result.totals}
            getRowKey={row => row.orderId}
            defaultSort={{ key: "lossPct", direction: "desc" }}
            highlightRow={minLossPct ? row => row.lossPct >= minLossPct : undefined}
          />
        </Stack>
      )}
    </ReportCard>
  );
}
