"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type {
  IProductionComparisonRow,
  IProductionComparisonTotals,
  IReportFilters,
  IReportResult,
  ReportGranularity,
  ReportUnit
} from "@/types/pages/reports";
import { productionComparisonColumns } from "@/utils/columns/reports";
import { formatDate, formatKg, formatPct, formatPeriodLabel, formatTon, formatUnits } from "@/utils/reports/format";
import { REPORTS } from "@/utils/reports/registry";

import EmptyState from "../shared/empty-state";
import ExportButtons from "../shared/export-buttons";
import MetricCards from "../shared/metric-cards";
import ReportCard from "../shared/report-card";
import ReportControlSelect from "../shared/report-control-select";
import ReportTable from "../shared/report-table";

const LineComparisonChart = dynamic(() => import("../charts/line-comparison-chart"), {
  ssr: false,
  loading: () => <Loader type='component' />
});

interface Props {
  result: IReportResult<IProductionComparisonRow, IProductionComparisonTotals>;
  filters: IReportFilters;
}

export default function ComparisonReport({ result, filters }: Props) {
  const unit = filters.unit ?? "ton";
  const empty = result.data.length === 0;
  const valueFormatter = unit === "ton" ? formatTon : unit === "units" ? formatUnits : formatKg;
  const previousFrom = typeof result.meta.filters.previousFrom === "string" ? result.meta.filters.previousFrom : null;
  const previousTo = typeof result.meta.filters.previousTo === "string" ? result.meta.filters.previousTo : null;

  const chartData = result.data.map(row => ({
    ...row,
    periodLabel: formatPeriodLabel(row.periodLabel)
  }));

  const { update } = useReportUrl(REPORTS["production-comparison"], filters);

  return (
    <ReportCard
      title='Comparativo contra el año anterior'
      warnings={result.warnings}
      actions={<ExportButtons reportKey='production-comparison' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:calendar-range", label: "Actual", value: valueFormatter(result.totals.current) },
          { icon: "mdi:calendar-arrow-left", label: "Anterior", value: valueFormatter(result.totals.previous) },
          { icon: "mdi:swap-vertical", label: "Variación", value: formatPct(result.totals.variationPct) }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap' alignItems='center'>
        <ReportControlSelect
          label='Granularidad'
          value={filters.granularity ?? "month"}
          options={[
            { value: "week", label: "Semana" },
            { value: "month", label: "Mes" }
          ]}
          onChange={value => update({ granularity: value as ReportGranularity })}
        />
        <ReportControlSelect
          label='Unidad'
          value={unit}
          options={[
            { value: "kg", label: "Kg" },
            { value: "ton", label: "Ton" },
            { value: "units", label: "Unidades" }
          ]}
          onChange={value => update({ unit: value as ReportUnit })}
        />
        {previousFrom && previousTo && (
          <Typography variant='caption' color='text.secondary'>
            Comparado con {formatDate(previousFrom)} – {formatDate(previousTo)}
          </Typography>
        )}
      </Stack>
      {empty ? (
        <EmptyState />
      ) : (
        <Stack spacing={3}>
          <LineComparisonChart data={chartData} valueFormatter={valueFormatter} />
          <ReportTable
            rows={result.data}
            columns={productionComparisonColumns(unit, filters.granularity)}
            totals={result.totals}
            getRowKey={row => row.period}
            defaultSort={{ key: "period", direction: "asc" }}
          />
        </Stack>
      )}
    </ReportCard>
  );
}
