import { Chip, Stack } from "@mui/material";

import type {
  ICostPerKgRow,
  ICostPerKgTotals,
  IMassBalanceRow,
  IMassBalanceTotals,
  IProductionComparisonRow,
  IProductionComparisonTotals,
  IProductionVolumeRow,
  IProductionVolumeTotals,
  ITopProductRow,
  ITopProductTotals,
  ReportColumn,
  ReportGranularity,
  ReportUnit
} from "@/types/pages/reports";
import {
  formatCop,
  formatDate,
  formatKg,
  formatPct,
  formatPeriodLabel,
  formatTon,
  formatUnits
} from "@/utils/reports/format";

const listNames = (names: string[]): string => (names.length ? names.join(", ") : "—");

const formatQuantity = (value: number, unit: ReportUnit): string => {
  if (unit === "ton") return formatTon(value);
  if (unit === "units") return formatUnits(value);

  return formatKg(value);
};

export const productionVolumeColumns = (
  granularity?: ReportGranularity
): ReportColumn<IProductionVolumeRow, IProductionVolumeTotals>[] => [
    {
      key: "period",
      label: "Período",
      render: row => formatPeriodLabel(row.period, granularity),
      sortValue: row => row.period
    },
    {
      key: "line",
      label: "Línea",
      render: row => row.lineName || "—",
      sortValue: row => row.lineName
    },
    {
      key: "category",
      label: "Categoría",
      render: row => row.categoryName || "—",
      sortValue: row => row.categoryName
    },
    {
      key: "kg",
      label: "Kg",
      align: "right",
      render: row => formatKg(row.kg),
      sortValue: row => row.kg,
      renderTotal: totals => formatKg(totals.kg)
    },
    {
      key: "ton",
      label: "Ton",
      align: "right",
      render: row => formatTon(row.ton),
      sortValue: row => row.ton,
      renderTotal: totals => formatTon(totals.ton)
    },
    {
      key: "orders",
      label: "Órdenes",
      align: "right",
      render: row => row.orders,
      sortValue: row => row.orders,
      renderTotal: totals => totals.orders
    }
  ];

export const productionComparisonColumns = (
  unit: ReportUnit,
  granularity?: ReportGranularity
): ReportColumn<IProductionComparisonRow, IProductionComparisonTotals>[] => [
    {
      key: "period",
      label: "Período",
      render: row => formatPeriodLabel(row.period, granularity),
      sortValue: row => row.period
    },
    {
      key: "current",
      label: "Actual",
      align: "right",
      render: row => formatQuantity(row.current, unit),
      sortValue: row => row.current,
      renderTotal: totals => formatQuantity(totals.current, unit)
    },
    {
      key: "previous",
      label: "Anterior",
      align: "right",
      render: row => formatQuantity(row.previous, unit),
      sortValue: row => row.previous,
      renderTotal: totals => formatQuantity(totals.previous, unit)
    },
    {
      key: "variationPct",
      label: "Variación",
      align: "right",
      render: row => formatPct(row.variationPct),
      sortValue: row => row.variationPct,
      renderTotal: totals => formatPct(totals.variationPct)
    },
    {
      key: "currentCumulative",
      label: "Acumulado actual",
      align: "right",
      render: row => formatQuantity(row.currentCumulative, unit),
      sortValue: row => row.currentCumulative
    },
    {
      key: "previousCumulative",
      label: "Acumulado anterior",
      align: "right",
      render: row => formatQuantity(row.previousCumulative, unit),
      sortValue: row => row.previousCumulative
    }
  ];

export const massBalanceColumns = (): ReportColumn<IMassBalanceRow, IMassBalanceTotals>[] => [
  {
    key: "orderId",
    label: "Orden",
    align: "right",
    width: 80,
    render: row => row.orderId,
    sortValue: row => row.orderId
  },
  {
    key: "batch",
    label: "Lote",
    render: row => row.batch,
    sortValue: row => row.batch
  },
  {
    key: "closedAt",
    label: "Cierre",
    render: row => formatDate(row.closedAt),
    sortValue: row => row.closedAt
  },
  {
    key: "product",
    label: "Producto",
    render: row => listNames(row.products.map(item => item.productName)),
    sortValue: row => row.products.map(item => item.productName).join(", ")
  },
  {
    key: "line",
    label: "Línea",
    render: row => listNames(row.lines.map(item => item.lineName)),
    sortValue: row => row.lines.map(item => item.lineName).join(", ")
  },
  {
    key: "expectedKg",
    label: "Teórico",
    align: "right",
    render: row => formatKg(row.expectedKg),
    sortValue: row => row.expectedKg,
    renderTotal: totals => formatKg(totals.expectedKg)
  },
  {
    key: "producedKg",
    label: "Envasado",
    align: "right",
    render: row => formatKg(row.producedKg),
    sortValue: row => row.producedKg,
    renderTotal: totals => formatKg(totals.producedKg)
  },
  {
    key: "lossKg",
    label: "Merma",
    align: "right",
    render: row => formatKg(row.lossKg),
    sortValue: row => row.lossKg,
    renderTotal: totals => formatKg(totals.lossKg)
  },
  {
    key: "lossPct",
    label: "% merma",
    align: "right",
    render: row => formatPct(row.lossPct),
    sortValue: row => row.lossPct,
    renderTotal: totals => formatPct(totals.lossPct)
  },
  {
    key: "yieldPct",
    label: "Rendimiento",
    align: "right",
    render: row => formatPct(row.yieldPct),
    sortValue: row => row.yieldPct
  },
  {
    key: "extraFeedstockKg",
    label: "MP extra",
    align: "right",
    render: row => formatKg(row.extraFeedstockKg),
    sortValue: row => row.extraFeedstockKg
  }
];

export const costPerKgColumns = (unit: "kg" | "ton"): ReportColumn<ICostPerKgRow, ICostPerKgTotals>[] => {
  const unitLabel = unit === "ton" ? "Cop/ton" : "Cop/kg";

  return [
    {
      key: "period",
      label: "Período",
      render: row => formatPeriodLabel(row.period)
    },
    {
      key: "kg",
      label: "Kg",
      align: "right",
      render: row => formatKg(row.kg),
      sortValue: row => row.kg,
      renderTotal: totals => formatKg(totals.kg)
    },
    {
      key: "feedstockCopKg",
      label: `MP ${unitLabel}`,
      align: "right",
      render: row => formatCop(row.feedstockCopKg),
      sortValue: row => row.feedstockCopKg,
      renderTotal: totals => formatCop(totals.feedstockCopKg)
    },
    {
      key: "packagingCopKg",
      label: `Empaque ${unitLabel}`,
      align: "right",
      render: row => formatCop(row.packagingCopKg),
      sortValue: row => row.packagingCopKg,
      renderTotal: totals => formatCop(totals.packagingCopKg)
    },
    {
      key: "cifCopKg",
      label: `CIF ${unitLabel}`,
      align: "right",
      render: row => formatCop(row.cifCopKg),
      sortValue: row => row.cifCopKg,
      renderTotal: totals => formatCop(totals.cifCopKg)
    },
    {
      key: "totalCopKg",
      label: `Total ${unitLabel}`,
      align: "right",
      render: row => formatCop(unit === "ton" ? row.totalCopTon : row.totalCopKg),
      sortValue: row => (unit === "ton" ? row.totalCopTon : row.totalCopKg),
      renderTotal: totals => formatCop(unit === "ton" ? totals.totalCopTon : totals.totalCopKg)
    },
    {
      key: "cifByType",
      label: "CIF por tipo",
      render: row =>
        row.cifByType.length ? row.cifByType.map(item => `${item.typeName}: ${formatCop(item.copKg)}`).join(" · ") : "—"
    },
    {
      key: "status",
      label: "Estado",
      render: row => (
        <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
          {row.cifIncomplete && <Chip size='small' color='warning' label='CIF incompleto' />}
          {row.materialIncomplete && <Chip size='small' color='warning' label='Material incompleto' />}
          {!row.cifIncomplete && !row.materialIncomplete && <Chip size='small' color='success' label='Completo' />}
        </Stack>
      )
    }
  ];
};

export const topProductsColumns = (): ReportColumn<ITopProductRow, ITopProductTotals>[] => [
  {
    key: "rank",
    label: "#",
    align: "right",
    width: 56,
    render: row => row.rank,
    sortValue: row => row.rank
  },
  {
    key: "productName",
    label: "Producto",
    render: row => row.productName,
    sortValue: row => row.productName
  },
  {
    key: "lineName",
    label: "Línea",
    render: row => row.lineName || "—",
    sortValue: row => row.lineName
  },
  {
    key: "categoryName",
    label: "Categoría",
    render: row => row.categoryName || "—",
    sortValue: row => row.categoryName
  },
  {
    key: "units",
    label: "Unidades",
    align: "right",
    render: row => row.units,
    sortValue: row => row.units,
    renderTotal: totals => totals.units
  },
  {
    key: "kg",
    label: "Kg",
    align: "right",
    render: row => formatKg(row.kg),
    sortValue: row => row.kg,
    renderTotal: totals => formatKg(totals.kg)
  },
  {
    key: "netSales",
    label: "Venta neta",
    align: "right",
    render: row => formatCop(row.netSales),
    sortValue: row => row.netSales,
    renderTotal: totals => formatCop(totals.netSales)
  },
  {
    key: "valuedRemissionLines",
    label: "Líneas de remisión valoradas",
    align: "right",
    render: row => row.valuedRemissionLines,
    sortValue: row => row.valuedRemissionLines
  }
];
