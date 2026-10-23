import type { ReactNode } from "react";

export type ReportTab = "produccion" | "ventas";

export type ReportKey =
  | "production-volume"
  | "production-comparison"
  | "production-mass-balance"
  | "production-cost-per-kg"
  | "top-products";

export type ReportFilterKey =
  | "dateRange"
  | "subject"
  | "granularity"
  | "groupBy"
  | "unit"
  | "productIds"
  | "batch"
  | "lineIds"
  | "categoryIds"
  | "providerIds"
  | "formulationId"
  | "versionId"
  | "minLossPct"
  | "cifTypeIds"
  | "origin"
  | "metric"
  | "top"
  | "ivaPct";

export type ReportUnit = "kg" | "ton" | "units";

export type ReportGranularity = "day" | "week" | "month" | "year";

export type VolumeSubject = "product" | "feedstock";

export type VolumeGroupBy = "line" | "category";

export type SalesMetric = "cop" | "kg" | "units";

export type SalesOrigin = "siigo" | "remision";

export interface IReportOption {
  id: string | number;
  name: string;
}

export interface IReportProductOption extends IReportOption {
  lineId?: string | null;
  categoryId?: string | null;
}

export interface IReportFilters {
  from: string;
  to: string;
  subject?: VolumeSubject;
  granularity?: ReportGranularity;
  groupBy?: VolumeGroupBy;
  unit?: ReportUnit;
  productIds?: string[];
  batch?: string;
  lineIds?: string[];
  categoryIds?: string[];
  providerIds?: number[];
  formulationId?: string;
  versionId?: string;
  minLossPct?: number;
  cifTypeIds?: number[];
  origin?: SalesOrigin;
  metric?: SalesMetric;
  top?: number;
  ivaPct?: number;
}

export interface IReportFiltersCatalog {
  lines: IReportOption[];
  categories: IReportOption[];
  products: IReportProductOption[];
  providers: IReportOption[];
  origins: IReportOption[];
  cifTypes: IReportOption[];
  formulations?: IReportOption[];
  versions?: IReportOption[];
  uncategorized: {
    products: number;
    feedstock: number;
    packaging: number;
  };
}

export interface IReportWarning {
  code: string;
  message: string;
  count?: number | null;
}

export interface IReportMeta {
  report: string;
  dateField: string;
  filters: Record<string, unknown>;
  generatedAt: string;
  notes?: string[];
}

export interface IReportResult<TData, TTotals> {
  meta: IReportMeta;
  warnings: IReportWarning[];
  totals: TTotals;
  data: TData[];
}

export interface ReportColumn<TData, TTotals = unknown> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render: (row: TData) => ReactNode;
  sortValue?: (row: TData) => string | number | null;
  renderTotal?: (totals: TTotals) => ReactNode;
}

export interface IProductionVolumeRow {
  period: string;
  lineId: string | null;
  lineName: string;
  categoryId: string | null;
  categoryName: string;
  kg: number;
  ton: number;
  orders: number;
}

export interface IProductionVolumeTotals {
  kg: number;
  ton: number;
  orders: number;
}

export interface IProductionComparisonRow {
  period: string;
  periodLabel: string;
  current: number;
  previous: number;
  currentCumulative: number;
  previousCumulative: number;
  variationPct: number | null;
}

export interface IProductionComparisonTotals {
  current: number;
  previous: number;
  variationPct: number | null;
}

export interface IMassBalanceProduct {
  productId: string;
  productName: string;
}

export interface IMassBalanceLine {
  lineId: string | null;
  lineName: string;
}

export interface IMassBalanceRow {
  orderId: number;
  batch: string;
  closedAt: string;
  products: IMassBalanceProduct[];
  lines: IMassBalanceLine[];
  expectedKg: number;
  producedKg: number;
  lossKg: number;
  lossPct: number;
  yieldPct: number;
  extraFeedstockKg: number;
}

export interface IMassBalanceTotals {
  expectedKg: number;
  producedKg: number;
  lossKg: number;
  lossPct: number;
  orders: number;
}

export interface ICostCifType {
  typeId: number;
  typeName: string;
  copKg: number;
}

export interface ICostPerKgRow {
  period: string;
  kg: number;
  feedstockCopKg: number;
  packagingCopKg: number;
  cifCopKg: number;
  cifByType: ICostCifType[];
  totalCopKg: number;
  totalCopTon: number;
  cifIncomplete: boolean;
  materialIncomplete: boolean;
}

export interface ICostPerKgTotals {
  kg: number;
  feedstockCopKg: number;
  packagingCopKg: number;
  cifCopKg: number;
  totalCopKg: number;
  totalCopTon: number;
}

export interface ITopProductRow {
  rank: number;
  productId: string;
  productName: string;
  lineName: string;
  categoryName: string;
  units: number;
  kg: number;
  netSales: number;
  valuedRemissionLines: number;
}

export interface ITopProductTotals {
  units: number;
  kg: number;
  netSales: number;
  products: number;
}
