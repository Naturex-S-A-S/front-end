"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type { IParetoRow, IParetoTotals, IReportFilters, IReportResult, SalesOrigin } from "@/types/pages/reports";
import { paretoColumns } from "@/utils/columns/reports";
import { formatCop } from "@/utils/reports/format";
import { REPORTS } from "@/utils/reports/registry";

import EmptyState from "../shared/empty-state";
import ExportButtons from "../shared/export-buttons";
import MetricCards from "../shared/metric-cards";
import ReportCard from "../shared/report-card";
import ReportControlSelect from "../shared/report-control-select";
import ReportTable from "../shared/report-table";

const ParetoChart = dynamic(() => import("../charts/pareto-chart"), {
  ssr: false,
  loading: () => <Loader type='component' />
});

interface Props {
  result: IReportResult<IParetoRow, IParetoTotals>;
  filters: IReportFilters;
}

export default function ProfitParetoReport({ result, filters }: Props) {
  const empty = result.data.length === 0;
  const { update } = useReportUrl(REPORTS["profit-pareto"], filters);
  const { productsTo80Pct, products } = result.totals;

  const chartData = result.data.map(row => ({
    name: row.productName,
    value: row.netProfit,
    cumulativePct: row.paretoCumulativePct
  }));

  return (
    <ReportCard
      title='Utilidad neta por producto y Pareto'
      warnings={result.warnings}
      actions={<ExportButtons reportKey='profit-pareto' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:package-variant", label: "Productos", value: String(products) },
          { icon: "mdi:cash-multiple", label: "Venta neta", value: formatCop(result.totals.netSales) },
          { icon: "mdi:cash-plus", label: "Utilidad neta", value: formatCop(result.totals.netProfit) },
          {
            icon: "mdi:chart-pareto",
            label: "Concentración",
            value: productsTo80Pct > 0 ? `${productsTo80Pct} de ${products}` : "—",
            helper: "productos explican el 80 %"
          }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
        <ReportControlSelect
          label='Origen'
          value={filters.origin ?? ""}
          options={[
            { value: "", label: "Todos" },
            { value: "siigo", label: "Siigo" },
            { value: "remision", label: "Remisión" }
          ]}
          onChange={value => update({ origin: value ? (value as SalesOrigin) : undefined })}
        />
      </Stack>
      {empty ? (
        <EmptyState />
      ) : (
        <Stack spacing={3}>
          {productsTo80Pct > 0 && (
            <Typography variant='body2'>
              <strong>{productsTo80Pct}</strong> {productsTo80Pct === 1 ? "producto explica" : "productos explican"} el
              80 % de la utilidad.
            </Typography>
          )}
          <ParetoChart data={chartData} height={Math.max(380, Math.min(chartData.length, 40) * 12 + 300)} />
          <ReportTable
            rows={result.data}
            columns={paretoColumns()}
            totals={result.totals}
            getRowKey={row => row.productId}
          />
          <Typography variant='caption' color='text.secondary'>
            El % acumulado solo suma las utilidades positivas y termina en 100 %. Las utilidades negativas se muestran en
            rojo.
          </Typography>
        </Stack>
      )}
    </ReportCard>
  );
}
