"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type {
  IReportFilters,
  IReportResult,
  ITopProductRow,
  ITopProductTotals,
  SalesMetric,
  SalesOrigin
} from "@/types/pages/reports";
import { topProductsColumns } from "@/utils/columns/reports";
import { getLineColor } from "@/utils/reports/colors";
import { formatCop, formatKg } from "@/utils/reports/format";
import { REPORTS } from "@/utils/reports/registry";

import EmptyState from "../shared/empty-state";
import ExportButtons from "../shared/export-buttons";
import MetricCards from "../shared/metric-cards";
import ReportCard from "../shared/report-card";
import ReportControlSelect from "../shared/report-control-select";
import ReportTable from "../shared/report-table";

const HorizontalBarChart = dynamic(() => import("../charts/horizontal-bar-chart"), {
  ssr: false,
  loading: () => <Loader type='component' />
});

interface Props {
  result: IReportResult<ITopProductRow, ITopProductTotals>;
  filters: IReportFilters;
}

const numberFormatter = new Intl.NumberFormat("es-CO");

export default function TopProductsReport({ result, filters }: Props) {
  const empty = result.data.length === 0;
  const metric = filters.metric ?? "cop";
  const { update } = useReportUrl(REPORTS["top-products"], filters);

  const metricConfig = {
    cop: { value: (row: ITopProductRow) => row.netSales, formatter: formatCop },
    kg: { value: (row: ITopProductRow) => row.kg, formatter: formatKg },
    units: { value: (row: ITopProductRow) => row.units, formatter: (value: number) => numberFormatter.format(value) }
  }[metric];

  const chartData = result.data.map(row => ({
    name: row.productName,
    value: metricConfig.value(row),
    color: getLineColor(row.lineName)
  }));

  return (
    <ReportCard
      title={`Top ${filters.top ?? 10} de productos vendidos`}
      warnings={result.warnings}
      actions={<ExportButtons reportKey='top-products' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:package-variant", label: "Productos", value: String(result.totals.products) },
          { icon: "mdi:counter", label: "Unidades", value: numberFormatter.format(result.totals.units) },
          { icon: "mdi:weight-kilogram", label: "Kilogramos", value: formatKg(result.totals.kg) },
          { icon: "mdi:cash-multiple", label: "Venta neta", value: formatCop(result.totals.netSales) }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
        <ReportControlSelect
          label='Métrica'
          value={metric}
          options={[
            { value: "cop", label: "COP" },
            { value: "kg", label: "Kg" },
            { value: "units", label: "Unidades" }
          ]}
          onChange={value => update({ metric: value as SalesMetric })}
        />
        <ReportControlSelect
          label='Top'
          value={filters.top ?? 10}
          options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 50, label: "50" }
          ]}
          onChange={value => update({ top: Number(value) })}
        />
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
          <HorizontalBarChart
            data={chartData}
            valueFormatter={metricConfig.formatter}
            height={Math.max(320, chartData.length * 44)}
          />
          <ReportTable
            rows={result.data}
            columns={topProductsColumns()}
            totals={result.totals}
            getRowKey={row => row.productId}
            defaultSort={{ key: "rank", direction: "asc" }}
          />
          <Typography variant='caption' color='text.secondary'>
            La venta neta se calcula sin IVA (0% en la Etapa 1).
          </Typography>
        </Stack>
      )}
    </ReportCard>
  );
}
