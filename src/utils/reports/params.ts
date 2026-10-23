import { differenceInCalendarDays, format, isValid, parseISO, startOfMonth } from "date-fns";

import type {
  IReportFilters,
  ReportGranularity,
  ReportTab,
  ReportUnit,
  SalesMetric,
  SalesOrigin,
  VolumeGroupBy,
  VolumeSubject
} from "@/types/pages/reports";
import { getDefaultReportForTab, getReportEntry, type ReportEntry } from "@/utils/reports/registry";

export type SearchParams = Record<string, string | string[] | undefined>;

export interface ReportSelection {
  tab: ReportTab;
  report: ReportEntry;
  filters: IReportFilters;
  error: string | null;
}

export interface ReportValidation {
  valid: boolean;
  errors: Partial<Record<keyof IReportFilters | "dateRange", string>>;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const readScalar = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const readList = (value: string | string[] | undefined): string[] => {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return Array.from(
    new Set(
      values
        .flatMap(item => item.split(","))
        .map(item => item.trim())
        .filter(Boolean)
    )
  );
};

const readNumber = (value: string | string[] | undefined): number | undefined => {
  const raw = readScalar(value)?.trim();

  if (!raw) return undefined;

  const number = Number(raw);

  return Number.isFinite(number) ? number : undefined;
};

const readNumericList = (value: string | string[] | undefined): number[] =>
  readList(value).map(Number).filter(Number.isFinite);

const isValidDateString = (value: string | undefined): value is string => {
  if (!value || !DATE_PATTERN.test(value)) return false;

  const date = parseISO(value);

  return isValid(date) && format(date, "yyyy-MM-dd") === value;
};

const isReportTab = (value: string | undefined): value is ReportTab => value === "produccion" || value === "ventas";

const isVolumeSubject = (value: string | undefined): value is VolumeSubject =>
  value === "product" || value === "feedstock";

const isVolumeGroupBy = (value: string | undefined): value is VolumeGroupBy => value === "line" || value === "category";

const isGranularity = (value: string | undefined): value is ReportGranularity =>
  value === "day" || value === "week" || value === "month" || value === "year";

const isUnit = (value: string | undefined): value is ReportUnit =>
  value === "kg" || value === "ton" || value === "units";

const isSalesMetric = (value: string | undefined): value is SalesMetric =>
  value === "cop" || value === "kg" || value === "units";

const isSalesOrigin = (value: string | undefined): value is SalesOrigin => value === "siigo" || value === "remision";

export const getDefaultDateRange = (now: Date = new Date()): Pick<IReportFilters, "from" | "to"> => ({
  from: format(startOfMonth(now), "yyyy-MM-dd"),
  to: format(now, "yyyy-MM-dd")
});

export const createDefaultFilters = (report: ReportEntry, now: Date = new Date()): IReportFilters => {
  const filters: IReportFilters = {
    ...getDefaultDateRange(now),
    ...report.defaults
  };

  if (report.key === "top-products") filters.ivaPct = 0;

  return filters;
};

const parseFilters = (report: ReportEntry, searchParams: SearchParams, now: Date): IReportFilters => {
  const defaults = createDefaultFilters(report, now);
  const filters: IReportFilters = { ...defaults };
  const allowed = new Set(report.filters);

  const from = readScalar(searchParams.from);
  const to = readScalar(searchParams.to);

  if (isValidDateString(from)) filters.from = from;
  if (isValidDateString(to)) filters.to = to;

  if (allowed.has("subject")) {
    const subject = readScalar(searchParams.subject);

    filters.subject = isVolumeSubject(subject) ? subject : defaults.subject ?? "product";
  }

  if (allowed.has("granularity")) {
    const granularity = readScalar(searchParams.granularity);

    filters.granularity = isGranularity(granularity) ? granularity : defaults.granularity ?? "month";
  }

  if (allowed.has("groupBy")) {
    const groupBy = readScalar(searchParams.groupBy);

    filters.groupBy = isVolumeGroupBy(groupBy) ? groupBy : defaults.groupBy ?? "line";
  }

  if (allowed.has("unit")) {
    const unit = readScalar(searchParams.unit);

    filters.unit = isUnit(unit) ? unit : defaults.unit ?? "kg";
  }

  if (allowed.has("productIds")) {
    const productIds = readList(searchParams.productIds);

    if (productIds.length) filters.productIds = productIds;
    else delete filters.productIds;
  }

  if (allowed.has("batch")) {
    const batch = readScalar(searchParams.batch)?.trim();

    if (batch) filters.batch = batch;
    else delete filters.batch;
  }

  if (allowed.has("lineIds")) {
    const lineIds = readList(searchParams.lineIds);

    if (lineIds.length) filters.lineIds = lineIds;
    else delete filters.lineIds;
  }

  if (allowed.has("categoryIds")) {
    const categoryIds = readList(searchParams.categoryIds);

    if (categoryIds.length) filters.categoryIds = categoryIds;
    else delete filters.categoryIds;
  }

  if (allowed.has("providerIds")) {
    const providerIds = readNumericList(searchParams.providerIds);

    if (providerIds.length) filters.providerIds = providerIds;
    else delete filters.providerIds;
  }

  if (allowed.has("formulationId")) {
    const formulationId = readScalar(searchParams.formulationId)?.trim();

    if (formulationId) filters.formulationId = formulationId;
    else delete filters.formulationId;
  }

  if (allowed.has("versionId")) {
    const versionId = readScalar(searchParams.versionId)?.trim();

    if (versionId) filters.versionId = versionId;
    else delete filters.versionId;
  }

  if (allowed.has("minLossPct")) {
    const minLossPct = readNumber(searchParams.minLossPct);

    if (minLossPct !== undefined) filters.minLossPct = minLossPct;
    else delete filters.minLossPct;
  }

  if (allowed.has("cifTypeIds")) {
    const cifTypeIds = readNumericList(searchParams.cifTypeIds);

    if (cifTypeIds.length) filters.cifTypeIds = cifTypeIds;
    else delete filters.cifTypeIds;
  }

  if (allowed.has("origin")) {
    const origin = readScalar(searchParams.origin);

    filters.origin = isSalesOrigin(origin) ? origin : undefined;
  }

  if (allowed.has("metric")) {
    const metric = readScalar(searchParams.metric);

    filters.metric = isSalesMetric(metric) ? metric : defaults.metric ?? "cop";
  }

  if (allowed.has("top")) {
    const top = readNumber(searchParams.top);

    filters.top = top !== undefined ? top : defaults.top ?? 10;
  }

  if (report.key === "top-products") filters.ivaPct = 0;

  return filters;
};

export const validateFilters = (filters: IReportFilters): ReportValidation => {
  const errors: ReportValidation["errors"] = {};
  const from = parseISO(filters.from);
  const to = parseISO(filters.to);

  if (!isValidDateString(filters.from)) {
    errors.from = "La fecha inicial no es válida.";
  }

  if (!isValidDateString(filters.to)) {
    errors.to = "La fecha final no es válida.";
  }

  if (isValid(from) && isValid(to)) {
    if (from > to) {
      errors.dateRange = "La fecha inicial no puede ser posterior a la fecha final.";
    } else if (differenceInCalendarDays(to, from) + 1 > 731) {
      errors.dateRange = "El rango no puede superar los 731 días.";
    }
  }

  if (filters.top !== undefined && (!Number.isInteger(filters.top) || filters.top < 1 || filters.top > 100)) {
    errors.top = "El Top debe ser un entero entre 1 y 100.";
  }

  if (
    filters.minLossPct !== undefined &&
    (!Number.isFinite(filters.minLossPct) || filters.minLossPct < 0 || filters.minLossPct > 100)
  ) {
    errors.minLossPct = "El porcentaje de pérdida debe estar entre 0 y 100.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const resolveReportSelection = (searchParams: SearchParams, now: Date = new Date()): ReportSelection => {
  const requestedReport = getReportEntry(readScalar(searchParams.report));

  const tab =
    requestedReport?.tab ??
    (isReportTab(readScalar(searchParams.tab)) ? (readScalar(searchParams.tab) as ReportTab) : "produccion");

  const report = requestedReport ?? getDefaultReportForTab(tab);
  const filters = parseFilters(report, searchParams, now);
  const validation = validateFilters(filters);

  return {
    tab,
    report,
    filters,
    error: Object.values(validation.errors).find(Boolean) ?? null
  };
};

export const toApiParams = (filters: IReportFilters): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    from: filters.from,
    to: filters.to
  };

  if (filters.subject) params.subject = filters.subject;
  if (filters.granularity) params.granularity = filters.granularity;
  if (filters.groupBy) params.groupBy = filters.groupBy;
  if (filters.unit) params.unit = filters.unit;
  if (filters.productIds?.length) params.productIds = filters.productIds.join(",");
  if (filters.batch) params.batch = filters.batch;
  if (filters.lineIds?.length) params.lotCategoryIds = filters.lineIds.join(",");
  if (filters.categoryIds?.length) params.categoryIds = filters.categoryIds.join(",");
  if (filters.providerIds?.length) params.providerIds = filters.providerIds.join(",");
  if (filters.formulationId) params.formulationId = filters.formulationId;
  if (filters.versionId) params.versionId = filters.versionId;
  if (filters.minLossPct !== undefined) params.minLossPct = filters.minLossPct;
  if (filters.cifTypeIds?.length) params.cifTypeIds = filters.cifTypeIds.join(",");
  if (filters.origin) params.origin = filters.origin;
  if (filters.metric) params.metric = filters.metric;
  if (filters.top !== undefined) params.top = filters.top;
  if (filters.ivaPct !== undefined) params.ivaPct = filters.ivaPct;

  return params;
};

export const buildReportSearchParams = (selection: Omit<ReportSelection, "error">): URLSearchParams => {
  const params = new URLSearchParams();

  params.set("tab", selection.tab);
  params.set("report", selection.report.key);
  params.set("from", selection.filters.from);
  params.set("to", selection.filters.to);

  if (selection.filters.subject) params.set("subject", selection.filters.subject);
  if (selection.filters.granularity) params.set("granularity", selection.filters.granularity);
  if (selection.filters.groupBy) params.set("groupBy", selection.filters.groupBy);
  if (selection.filters.unit) params.set("unit", selection.filters.unit);
  if (selection.filters.productIds?.length) params.set("productIds", selection.filters.productIds.join(","));
  if (selection.filters.batch) params.set("batch", selection.filters.batch);
  if (selection.filters.lineIds?.length) params.set("lineIds", selection.filters.lineIds.join(","));
  if (selection.filters.categoryIds?.length) params.set("categoryIds", selection.filters.categoryIds.join(","));
  if (selection.filters.providerIds?.length) params.set("providerIds", selection.filters.providerIds.join(","));
  if (selection.filters.formulationId) params.set("formulationId", selection.filters.formulationId);
  if (selection.filters.versionId) params.set("versionId", selection.filters.versionId);
  if (selection.filters.minLossPct !== undefined) params.set("minLossPct", String(selection.filters.minLossPct));
  if (selection.filters.cifTypeIds?.length) params.set("cifTypeIds", selection.filters.cifTypeIds.join(","));
  if (selection.filters.origin) params.set("origin", selection.filters.origin);
  if (selection.filters.metric) params.set("metric", selection.filters.metric);
  if (selection.filters.top !== undefined) params.set("top", String(selection.filters.top));
  if (selection.filters.ivaPct !== undefined) params.set("ivaPct", String(selection.filters.ivaPct));

  return params;
};

export const switchReportFilters = (
  current: IReportFilters,
  target: ReportEntry,
  now: Date = new Date()
): IReportFilters => {
  const next = createDefaultFilters(target, now);
  const source: Record<string, unknown> = { ...current };

  next.from = current.from;
  next.to = current.to;

  for (const key of target.filters) {
    if (key === "dateRange") continue;
    if (Object.prototype.hasOwnProperty.call(current, key)) Object.assign(next, { [key]: source[key] });
  }

  return next;
};
