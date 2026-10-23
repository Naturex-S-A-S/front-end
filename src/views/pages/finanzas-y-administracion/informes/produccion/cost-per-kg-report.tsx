"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type {
  ICostPerKgRow,
  ICostPerKgTotals,
  IReportFilters,
  IReportResult,
  ReportGranularity
} from "@/types/pages/reports";
import { costPerKgColumns } from "@/utils/columns/reports";
import { getLineColor } from "@/utils/reports/colors";
import { formatCop, formatKg, formatPeriodLabel } from "@/utils/reports/format";
import type { PivotSeries } from "@/utils/reports/pivot";
import { REPORTS } from "@/utils/reports/registry";

import EmptyState from "../shared/empty-state";
import ExportButtons from "../shared/export-buttons";
import MetricCards from "../shared/metric-cards";
import ReportCard from "../shared/report-card";
import ReportControlSelect from "../shared/report-control-select";
import ReportTable from "../shared/report-table";

const StackedBarChart = dynamic(() => import("../charts/stacked-bar-chart"), {
  ssr: false,
  loading: () => <Loader type='component' />
});

interface Props {
  result: IReportResult<ICostPerKgRow, ICostPerKgTotals>;
  filters: IReportFilters;
}

const BASE_SERIES: PivotSeries[] = [
  { key: "feedstock", label: "Materia prima", color: "#1E88E5" },
  { key: "packaging", label: "Empaque", color: "#43A047" }
];

const TOTAL_SERIES: PivotSeries = { key: "total", label: "Total", color: "#6D4C41" };

export default function CostPerKgReport({ result, filters }: Props) {
  const unit = filters.unit === "ton" ? "ton" : "kg";
  const empty = result.data.length === 0;
  const { update } = useReportUrl(REPORTS["production-cost-per-kg"], filters);

  const cifTypes = new Map<number, string>();

  result.data.forEach(row => row.cifByType.forEach(item => cifTypes.set(item.typeId, item.typeName)));

  const cifSeries: PivotSeries[] = cifTypes.size
    ? Array.from(cifTypes.entries()).map(([typeId, typeName]) => ({
        key: `cif_${typeId}`,
        label: typeName,
        color: getLineColor(`cif-${typeId}`)
      }))
    : [{ key: "cif", label: "CIF", color: "#F4511E" }];

  const chartData = result.data.map(row => {
    const cifValues = row.cifByType.reduce<Record<string, number>>((values, item) => {
      values[`cif_${item.typeId}`] = item.copKg;

      return values;
    }, {});

    return {
      period: formatPeriodLabel(row.period, filters.granularity),
      feedstock: row.feedstockCopKg,
      packaging: row.packagingCopKg,
      ...cifValues,
      ...(cifTypes.size === 0 ? { cif: row.cifCopKg } : {}),
      total: unit === "ton" ? row.totalCopTon : row.totalCopKg
    };
  });

  return (
    <ReportCard
      title={`Costo por ${unit === "ton" ? "tonelada" : "kilogramo"}`}
      warnings={result.warnings}
      actions={<ExportButtons reportKey='production-cost-per-kg' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:weight-kilogram", label: "Kg producidas", value: formatKg(result.totals.kg) },
          {
            icon: "mdi:seed-outline",
            label: `Materia prima Cop/${unit}`,
            value: formatCop(result.totals.feedstockCopKg)
          },
          {
            icon: "mdi:package-variant-closed",
            label: `Empaque Cop/${unit}`,
            value: formatCop(result.totals.packagingCopKg)
          },
          { icon: "mdi:factory", label: `CIF Cop/${unit}`, value: formatCop(result.totals.cifCopKg) },
          {
            icon: "mdi:cash-multiple",
            label: `Total Cop/${unit}`,
            value: formatCop(unit === "ton" ? result.totals.totalCopTon : result.totals.totalCopKg)
          }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
        <ReportControlSelect
          label='Unidad'
          value={unit}
          options={[
            { value: "kg", label: "COP/kg" },
            { value: "ton", label: "COP/ton" }
          ]}
          onChange={value => update({ unit: value === "ton" ? "ton" : "kg" })}
        />
        <ReportControlSelect
          label='Granularidad'
          value={filters.granularity ?? "month"}
          options={[
            { value: "month", label: "Mes" },
            { value: "year", label: "Año" }
          ]}
          onChange={value => update({ granularity: value as ReportGranularity })}
        />
      </Stack>
      {empty ? (
        <EmptyState />
      ) : (
        <Stack spacing={3}>
          <StackedBarChart
            data={chartData}
            series={[...BASE_SERIES, ...cifSeries]}
            total={TOTAL_SERIES}
            xKey='period'
            valueFormatter={formatCop}
            ariaLabel='Costo por kg o tonelada'
          />
          <ReportTable
            rows={result.data}
            columns={costPerKgColumns(unit)}
            totals={result.totals}
            getRowKey={row => row.period}
            defaultSort={{ key: "period", direction: "asc" }}
          />
        </Stack>
      )}
    </ReportCard>
  );
}
