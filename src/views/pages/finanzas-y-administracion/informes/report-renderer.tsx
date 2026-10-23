"use client";

import type {
  ICostPerKgRow,
  ICostPerKgTotals,
  IMassBalanceRow,
  IMassBalanceTotals,
  IProductionComparisonRow,
  IProductionComparisonTotals,
  IProductionVolumeRow,
  IProductionVolumeTotals,
  IReportFilters,
  IReportResult,
  ITopProductRow,
  ITopProductTotals
} from "@/types/pages/reports";
import type { ReportEntry } from "@/utils/reports/registry";

import ComparisonReport from "./produccion/comparison-report";
import CostPerKgReport from "./produccion/cost-per-kg-report";
import MassBalanceReport from "./produccion/mass-balance-report";
import VolumeReport from "./produccion/volume-report";
import TopProductsReport from "./ventas/top-products-report";

interface Props {
  report: ReportEntry;
  result: IReportResult<unknown, unknown>;
  filters: IReportFilters;
}

export default function ReportRenderer({ report, result, filters }: Props) {
  switch (report.key) {
    case "production-volume":
      return (
        <VolumeReport
          result={result as IReportResult<IProductionVolumeRow, IProductionVolumeTotals>}
          filters={filters}
        />
      );
    case "production-comparison":
      return (
        <ComparisonReport
          result={result as IReportResult<IProductionComparisonRow, IProductionComparisonTotals>}
          filters={filters}
        />
      );
    case "production-mass-balance":
      return (
        <MassBalanceReport result={result as IReportResult<IMassBalanceRow, IMassBalanceTotals>} filters={filters} />
      );
    case "production-cost-per-kg":
      return <CostPerKgReport result={result as IReportResult<ICostPerKgRow, ICostPerKgTotals>} filters={filters} />;
    case "top-products":
      return (
        <TopProductsReport result={result as IReportResult<ITopProductRow, ITopProductTotals>} filters={filters} />
      );
    default:
      return null;
  }
}
