import type { IReportFilters, ReportFilterKey, ReportKey, ReportTab } from "@/types/pages/reports";

export interface ReportEntry {
  key: ReportKey;
  tab: ReportTab;
  label: string;
  endpoint: string;
  dateLabel: string;
  filters: readonly ["dateRange", ...ReportFilterKey[]];
  defaults: Partial<IReportFilters>;
  disabled?: boolean;
  exportable: boolean;
}

export const REPORTS = {
  "production-volume": {
    key: "production-volume",
    tab: "produccion",
    label: "Kg / ton producidas",
    endpoint: "production/volume",
    dateLabel: "Fecha de ingreso a inventario",
    filters: [
      "dateRange",
      "subject",
      "granularity",
      "groupBy",
      "unit",
      "productIds",
      "batch",
      "lineIds",
      "categoryIds",
      "providerIds",
      "formulationId"
    ],
    defaults: { subject: "product", granularity: "month", groupBy: "line", unit: "kg" },
    exportable: true
  },
  "production-comparison": {
    key: "production-comparison",
    tab: "produccion",
    label: "Comparativo contra el año anterior",
    endpoint: "production/comparison",
    dateLabel: "Fecha de ingreso a inventario",
    filters: ["dateRange", "granularity", "unit", "productIds", "lineIds", "categoryIds"],
    defaults: { granularity: "month", unit: "ton" },
    exportable: true
  },
  "production-mass-balance": {
    key: "production-mass-balance",
    tab: "produccion",
    label: "Balance de masa y rendimiento",
    endpoint: "production/mass-balance",
    dateLabel: "Fecha de cierre de la orden",
    filters: ["dateRange", "productIds", "batch", "lineIds", "categoryIds", "formulationId", "versionId", "minLossPct"],
    defaults: {},
    exportable: true
  },
  "production-cost-per-kg": {
    key: "production-cost-per-kg",
    tab: "produccion",
    label: "Costo por kg / ton",
    endpoint: "production/cost-per-kg",
    dateLabel: "Fecha del snapshot de costo",
    disabled: true,
    filters: ["dateRange", "granularity", "unit", "productIds", "batch", "lineIds", "categoryIds", "cifTypeIds"],
    defaults: { granularity: "month", unit: "kg" },
    exportable: true
  },
  "top-products": {
    key: "top-products",
    tab: "ventas",
    label: "Top de productos vendidos",
    endpoint: "sales/top-products",
    dateLabel: "Fecha de carga del archivo",
    filters: ["dateRange", "productIds", "lineIds", "categoryIds", "origin", "metric", "top", "ivaPct"],
    defaults: { metric: "cop", top: 10, ivaPct: 0 },
    exportable: true
  }
} satisfies Record<ReportKey, ReportEntry>;

export const REPORTS_BY_TAB: Record<ReportTab, ReportEntry[]> = {
  produccion: [
    REPORTS["production-volume"],
    REPORTS["production-comparison"],
    REPORTS["production-mass-balance"],
    REPORTS["production-cost-per-kg"]
  ],
  ventas: [REPORTS["top-products"]]
};

export const getReportEntry = (key?: string | null): ReportEntry | null =>
  key && key in REPORTS ? REPORTS[key as ReportKey] : null;

export const getDefaultReportForTab = (tab: ReportTab): ReportEntry => REPORTS_BY_TAB[tab][0];
