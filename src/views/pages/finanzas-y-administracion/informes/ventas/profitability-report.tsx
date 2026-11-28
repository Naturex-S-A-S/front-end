"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type {
  IProfitabilityRow,
  IProfitabilityTotals,
  IReportFilters,
  IReportResult,
  SalesMarginType,
  SalesOrigin,
  SalesSortOrder
} from "@/types/pages/reports";
import { profitabilityColumns } from "@/utils/columns/reports";
import { formatCop, formatPct } from "@/utils/reports/format";
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
  result: IReportResult<IProfitabilityRow, IProfitabilityTotals>;
  filters: IReportFilters;
}

/** Semáforo de margen (specs R-2.2): rojo ≤ 0 %, amarillo < 15 %, verde ≥ 15 %. */
const LOW_MARGIN_PCT = 15;

export default function ProfitabilityReport({ result, filters }: Props) {
  const theme = useTheme();
  const empty = result.data.length === 0;
  const marginType = filters.marginType ?? "net";
  const sort = filters.sort ?? "desc";
  const { update } = useReportUrl(REPORTS.profitability, filters);

  const marginOf = (row: IProfitabilityRow): number | null =>
    marginType === "gross" ? row.grossMarginPct : row.netMarginPct;

  const marginColor = (value: number): string => {
    if (value <= 0) return theme.palette.error.main;
    if (value < LOW_MARGIN_PCT) return theme.palette.warning.main;

    return theme.palette.success.main;
  };

  // Sin venta neta el margen es null: el producto queda en la tabla pero no tiene barra.
  const chartData = result.data.flatMap(row => {
    const margin = marginOf(row);

    if (margin == null) return [];

    return [
      {
        name: row.linesWithoutCost > 0 ? `⚠ ${row.productName}` : row.productName,
        value: margin,
        color: marginColor(margin)
      }
    ];
  });

  const marginLabel = marginType === "gross" ? "Margen bruto" : "Margen neto";

  return (
    <ReportCard
      title={sort === "asc" ? "Productos menos rentables" : "Productos más rentables"}
      warnings={result.warnings}
      actions={<ExportButtons reportKey='profitability' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:package-variant", label: "Productos", value: String(result.totals.products) },
          { icon: "mdi:cash-multiple", label: "Venta neta", value: formatCop(result.totals.netSales) },
          { icon: "mdi:cash-plus", label: "Utilidad neta", value: formatCop(result.totals.netProfit) },
          { icon: "mdi:percent-outline", label: "Margen bruto", value: formatPct(result.totals.grossMarginPct) },
          { icon: "mdi:percent", label: "Margen neto", value: formatPct(result.totals.netMarginPct) }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
        <ReportControlSelect
          label='Margen'
          value={marginType}
          options={[
            { value: "net", label: "Neto" },
            { value: "gross", label: "Bruto" }
          ]}
          onChange={value => update({ marginType: value as SalesMarginType })}
        />
        <ReportControlSelect
          label='Orden'
          value={sort}
          options={[
            { value: "desc", label: "Más rentables" },
            { value: "asc", label: "Menos rentables" }
          ]}
          onChange={value => update({ sort: value as SalesSortOrder })}
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
          {chartData.length > 0 && (
            <HorizontalBarChart
              data={chartData}
              valueFormatter={formatPct}
              axisFormatter={value => `${value}%`}
              height={Math.max(320, chartData.length * 44)}
              ariaLabel={`${marginLabel} por producto`}
            />
          )}
          <ReportTable
            rows={result.data}
            columns={profitabilityColumns()}
            totals={result.totals}
            getRowKey={row => row.productId}
          />
          <Typography variant='caption' color='text.secondary'>
            {marginLabel} = (venta neta − materiales{marginType === "net" ? " − CIF − comisión" : ""}) / venta neta.
            La venta neta se calcula sin IVA. ⚠ = producto con ventas sin costo registrado.
          </Typography>
        </Stack>
      )}
    </ReportCard>
  );
}
