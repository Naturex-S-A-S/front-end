import "server-only";

import { apiFetch } from "@/api/apiFetch";
import type { IReportFilters, IReportFiltersCatalog, IReportResult, VolumeSubject } from "@/types/pages/reports";
import { getMockReport, getMockReportFilters } from "@/utils/mocks/reports";
import { toApiParams } from "@/utils/reports/params";

export interface ReportServerResponse<TData, TTotals> {
  data: IReportResult<TData, TTotals> | null;
  error: string | null;
}

export interface ReportCatalogResponse {
  data: IReportFiltersCatalog;
  error: string | null;
}

const emptyCatalog: IReportFiltersCatalog = {
  lines: [],
  categories: [],
  products: [],
  providers: [],
  origins: [],
  cifTypes: [],
  uncategorized: { products: 0, feedstock: 0, packaging: 0 }
};

const REPORTS_MOCK = false;

export async function getReportServer<TData, TTotals>(
  endpoint: string,
  filters: IReportFilters
): Promise<ReportServerResponse<TData, TTotals>> {
  try {
    if (REPORTS_MOCK) {
      return { data: getMockReport(endpoint, filters) as IReportResult<TData, TTotals>, error: null };
    }

    const params = new URLSearchParams();

    Object.entries(toApiParams(filters)).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    const data = await apiFetch<IReportResult<TData, TTotals>>(`reports/${endpoint}?${params.toString()}`, {
      tags: ["reports", `reports-${endpoint}`]
    });

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No se pudo cargar el reporte."
    };
  }
}

export async function getReportFiltersServer(subject: VolumeSubject = "product"): Promise<ReportCatalogResponse> {
  try {
    if (REPORTS_MOCK) {
      return { data: getMockReportFilters(), error: null };
    }

    const data = await apiFetch<IReportFiltersCatalog>(`reports/filters?subject=${subject}`, {
      tags: ["reports-filters", `reports-filters-${subject}`]
    });

    return { data: { ...emptyCatalog, ...data }, error: null };
  } catch (error) {
    return {
      data: emptyCatalog,
      error: error instanceof Error ? error.message : "No se pudieron cargar los filtros."
    };
  }
}
