"use client";

import dynamic from "next/dynamic";

import Stack from "@mui/material/Stack";

import Loader from "@/@core/components/react-spinners";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import type {
  IProductionVolumeRow,
  IProductionVolumeTotals,
  IReportFilters,
  IReportResult,
  VolumeGroupBy,
  VolumeSubject
} from "@/types/pages/reports";
import { productionVolumeColumns } from "@/utils/columns/reports";
import { formatKg, formatPeriodLabel, formatTon } from "@/utils/reports/format";
import { pivotStacked } from "@/utils/reports/pivot";
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
  result: IReportResult<IProductionVolumeRow, IProductionVolumeTotals>;
  filters: IReportFilters;
}

const SUBJECT_TITLES: Record<VolumeSubject, string> = {
  product: "Kg / ton de producto terminado",
  feedstock: "Materia prima consumida"
};

export default function VolumeReport({ result, filters }: Props) {
  const unit = filters.unit ?? "kg";
  const groupBy = filters.groupBy ?? "line";
  const empty = result.data.length === 0;
  const { update } = useReportUrl(REPORTS["production-volume"], filters);

  const chart = pivotStacked(result.data, {
    period: row => formatPeriodLabel(row.period, filters.granularity),
    series: row => {
      if (groupBy === "category") {
        return { id: row.categoryId ?? "none", name: row.categoryName || "Sin categoría" };
      }

      return { id: row.lineId ?? "none", name: row.lineName || "Sin línea" };
    },
    value: row => (unit === "ton" ? row.ton : row.kg)
  });

  const valueFormatter = unit === "ton" ? formatTon : formatKg;

  return (
    <ReportCard
      title={SUBJECT_TITLES[filters.subject ?? "product"]}
      warnings={result.warnings}
      actions={<ExportButtons reportKey='production-volume' filters={filters} disabled={empty} />}
    >
      <MetricCards
        items={[
          { icon: "mdi:weight-kilogram", label: "Kilogramos", value: formatKg(result.totals.kg) },
          { icon: "mdi:scale", label: "Toneladas", value: formatTon(result.totals.ton) },
          { icon: "mdi:clipboard-list-outline", label: "Órdenes", value: String(result.totals.orders) }
        ]}
      />
      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
        <ReportControlSelect
          label='Tipo'
          value={filters.subject ?? "product"}
          options={[
            { value: "product", label: "Producto" },
            { value: "feedstock", label: "Materia prima" }
          ]}
          onChange={value =>
            update({
              subject: value as VolumeSubject,
              categoryIds: undefined,
              providerIds: undefined
            })
          }
        />
        <ReportControlSelect
          label='Agrupar por'
          value={groupBy}
          options={[
            { value: "line", label: "Línea" },
            { value: "category", label: "Categoría" }
          ]}
          onChange={value => update({ groupBy: value as VolumeGroupBy })}
        />
        <ReportControlSelect
          label='Unidad'
          value={unit}
          options={[
            { value: "kg", label: "Kg" },
            { value: "ton", label: "Ton" }
          ]}
          onChange={value => update({ unit: value === "ton" ? "ton" : "kg" })}
        />
        <ReportControlSelect
          label='Granularidad'
          value={filters.granularity ?? "month"}
          options={[
            { value: "day", label: "Día" },
            { value: "week", label: "Semana" },
            { value: "month", label: "Mes" },
            { value: "year", label: "Año" }
          ]}
          onChange={value => update({ granularity: value as "day" | "week" | "month" | "year" })}
        />
      </Stack>
      {empty ? (
        <EmptyState />
      ) : (
        <Stack spacing={3}>
          <StackedBarChart
            data={chart.data}
            series={chart.series}
            xKey='period'
            valueFormatter={valueFormatter}
            ariaLabel='Producción por período'
          />
          <ReportTable
            rows={result.data}
            columns={productionVolumeColumns(filters.granularity)}
            totals={result.totals}
            getRowKey={(row, index) => `${row.period}-${row.lineId ?? "none"}-${row.categoryId ?? "none"}-${index}`}
            defaultSort={{ key: "period", direction: "asc" }}
          />
        </Stack>
      )}
    </ReportCard>
  );
}
