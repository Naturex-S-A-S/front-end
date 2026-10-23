"use client";

import { Chip, Stack } from "@mui/material";

import type { IReportFilters, IReportFiltersCatalog, IReportOption } from "@/types/pages/reports";
import { formatDate } from "@/utils/reports/format";
import { getDefaultDateRange } from "@/utils/reports/params";

interface Props {
  filters: IReportFilters;
  catalog: IReportFiltersCatalog;
  onDelete: (patch: Partial<IReportFilters>) => void;
}

const optionNames = (
  options: IReportOption[],
  ids: Array<string | number> | undefined,
  fallback: (id: string | number) => string = id => String(id)
): string =>
  (ids ?? []).map(id => options.find(option => String(option.id) === String(id))?.name ?? fallback(id)).join(", ");

const labels: Record<string, string> = {
  product: "Producto",
  feedstock: "Materia prima",
  day: "Día",
  week: "Semana",
  month: "Mes",
  year: "Año",
  line: "Línea",
  category: "Categoría",
  kg: "Kg",
  ton: "Ton",
  units: "Unidades",
  cop: "COP",
  siigo: "Siigo",
  remision: "Remisión"
};

export default function ActiveFilterChips({ filters, catalog, onDelete }: Props) {
  const chips: Array<{ key: string; label: string; patch: Partial<IReportFilters> }> = [
    {
      key: "dateRange",
      label: `Período: ${formatDate(filters.from)} - ${formatDate(filters.to)}`,
      patch: getDefaultDateRange()
    }
  ];

  if (filters.subject) {
    chips.push({
      key: "subject",
      label: `Tipo: ${labels[filters.subject]}`,
      patch: { subject: undefined, categoryIds: undefined, providerIds: undefined }
    });
  }

  if (filters.granularity) {
    chips.push({
      key: "granularity",
      label: `Granularidad: ${labels[filters.granularity]}`,
      patch: { granularity: undefined }
    });
  }

  if (filters.groupBy) {
    chips.push({ key: "groupBy", label: `Agrupación: ${labels[filters.groupBy]}`, patch: { groupBy: undefined } });
  }

  if (filters.unit) {
    chips.push({ key: "unit", label: `Unidad: ${labels[filters.unit]}`, patch: { unit: undefined } });
  }

  if (filters.productIds?.length) {
    chips.push({
      key: "productIds",
      label: `Productos: ${optionNames(catalog.products, filters.productIds)}`,
      patch: { productIds: undefined }
    });
  }

  if (filters.lineIds?.length) {
    chips.push({
      key: "lineIds",
      label: `Líneas: ${optionNames(catalog.lines, filters.lineIds, id => (id === "none" ? "Sin línea" : String(id)))}`,
      patch: { lineIds: undefined }
    });
  }

  if (filters.categoryIds?.length) {
    chips.push({
      key: "categoryIds",
      label: `Formas: ${optionNames(catalog.categories, filters.categoryIds, id =>
        id === "none" ? "Sin forma" : String(id)
      )}`,
      patch: { categoryIds: undefined }
    });
  }

  if (filters.providerIds?.length) {
    chips.push({
      key: "providerIds",
      label: `Proveedores: ${optionNames(catalog.providers, filters.providerIds)}`,
      patch: { providerIds: undefined }
    });
  }

  if (filters.formulationId) {
    chips.push({
      key: "formulationId",
      label: `Formulación: ${optionNames(catalog.formulations ?? [], [filters.formulationId])}`,
      patch: { formulationId: undefined, versionId: undefined }
    });
  }

  if (filters.versionId) {
    chips.push({
      key: "versionId",
      label: `Versión: ${optionNames(catalog.versions ?? [], [filters.versionId])}`,
      patch: { versionId: undefined }
    });
  }

  if (filters.batch) {
    chips.push({ key: "batch", label: `Lote: ${filters.batch}`, patch: { batch: undefined } });
  }

  if (filters.minLossPct !== undefined) {
    chips.push({
      key: "minLossPct",
      label: `Merma ≥ ${filters.minLossPct}%`,
      patch: { minLossPct: undefined }
    });
  }

  if (filters.origin) {
    chips.push({ key: "origin", label: `Origen: ${labels[filters.origin]}`, patch: { origin: undefined } });
  }

  if (filters.metric) {
    chips.push({ key: "metric", label: `Métrica: ${labels[filters.metric]}`, patch: { metric: undefined } });
  }

  if (filters.top !== undefined) {
    chips.push({ key: "top", label: `Top: ${filters.top}`, patch: { top: undefined } });
  }

  return (
    <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' aria-label='Filtros activos'>
      {chips.map(chip => (
        <Chip key={chip.key} size='small' label={chip.label} onDelete={() => onDelete(chip.patch)} />
      ))}
    </Stack>
  );
}
