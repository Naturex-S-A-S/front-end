import {
  addYears,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  setISOWeek,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subYears
} from "date-fns";

import type {
  ICostCifType,
  ICostPerKgRow,
  ICostPerKgTotals,
  IMassBalanceRow,
  IMassBalanceTotals,
  IProductionComparisonRow,
  IProductionComparisonTotals,
  IProductionVolumeRow,
  IProductionVolumeTotals,
  IReportFilters,
  IReportFiltersCatalog,
  IReportOption,
  IReportResult,
  IReportWarning,
  ITopProductRow,
  ITopProductTotals
} from "@/types/pages/reports";
import {
  PRODUCTION_MASS_BALANCE_MOCK_ORDERS,
  PRODUCTION_VOLUME_META,
  PRODUCTION_VOLUME_MOCK_ROWS
} from "./productionVolume";

interface ProductMeta {
  id: string;
  name: string;
  lineId: string;
  lineName: string;
  categoryId: string;
  categoryName: string;
}

const CIF_TYPES: Array<{ id: number; name: string }> = [
  { id: 1, name: "Mano de obra" },
  { id: 2, name: "Servicios públicos" },
  { id: 3, name: "Arriendo" }
];

const PROVIDERS: IReportOption[] = [
  { id: 1, name: "Insumos Andinos" },
  { id: 2, name: "Empaques del Valle" },
  { id: 3, name: "Distribuciones Naturaleza" }
];

const ORIGINS: IReportOption[] = [
  { id: "siigo", name: "Siigo" },
  { id: "remision", name: "Remisión" }
];

const productMap = new Map<string, ProductMeta>();

PRODUCTION_VOLUME_MOCK_ROWS.forEach(row => {
  if (!productMap.has(row.productId)) {
    productMap.set(row.productId, {
      id: row.productId,
      name: PRODUCTION_VOLUME_META.products.find(product => product.id === row.productId)?.name ?? row.productId,
      lineId: row.lineId,
      lineName: row.line,
      categoryId: row.shapeId,
      categoryName: row.shape
    });
  }
});

const products = Array.from(productMap.values()).sort((left, right) => left.name.localeCompare(right.name, "es"));

const formulations = Array.from(new Set(PRODUCTION_MASS_BALANCE_MOCK_ORDERS.map(order => order.formulation)))
  .sort()
  .map(formulation => ({ id: formulation, name: formulation }));

const round = (value: number, digits = 3): number => {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
};

const hash = (value: string): number =>
  Array.from(value).reduce((current, character) => (current * 31 + character.charCodeAt(0)) % 100000, 7);

const toSet = (values?: Array<string | number>): Set<string> => new Set((values ?? []).map(String));

const matches = (value: string | number | null | undefined, values: Set<string>): boolean =>
  values.size === 0 || (value !== null && value !== undefined && values.has(String(value)));

const inRange = (date: string, from: string, to: string): boolean => date >= from && date <= to;

const periodStart = (date: string, granularity: IReportFilters["granularity"]): string => {
  const parsed = parseISO(date);

  switch (granularity) {
    case "day":
      return format(parsed, "yyyy-MM-dd");
    case "week":
      return format(startOfWeek(parsed, { weekStartsOn: 1 }), "yyyy-MM-dd");
    case "year":
      return format(startOfYear(parsed), "yyyy-MM-dd");
    default:
      return format(startOfMonth(parsed), "yyyy-MM-dd");
  }
};

const filterProductionRows = (filters: IReportFilters) => {
  const productIds = toSet(filters.productIds);
  const lineIds = toSet(filters.lineIds);
  const categoryIds = toSet(filters.categoryIds);
  const batch = filters.batch?.trim().toUpperCase();

  return PRODUCTION_VOLUME_MOCK_ROWS.filter(
    row =>
      inRange(row.date, filters.from, filters.to) &&
      matches(row.productId, productIds) &&
      matches(row.lineId, lineIds) &&
      matches(row.shapeId, categoryIds) &&
      (!batch || row.batch.toUpperCase().includes(batch))
  );
};

const filterMassOrders = (filters: IReportFilters) => {
  const productIds = toSet(filters.productIds);
  const lineIds = toSet(filters.lineIds);
  const categoryIds = toSet(filters.categoryIds);
  const batch = filters.batch?.trim().toUpperCase();
  const formulationId = filters.formulationId ?? filters.versionId;

  return PRODUCTION_MASS_BALANCE_MOCK_ORDERS.filter(
    order =>
      order.status === "finalizada" &&
      inRange(order.closeDate, filters.from, filters.to) &&
      (productIds.size === 0 || order.productIds.some(productId => productIds.has(productId))) &&
      matches(order.lineId, lineIds) &&
      (categoryIds.size === 0 || order.shapeIds.some(shapeId => categoryIds.has(shapeId))) &&
      (!batch || order.batch.toUpperCase().includes(batch)) &&
      (!formulationId || order.formulation === formulationId) &&
      (filters.minLossPct === undefined || order.wastePct >= filters.minLossPct)
  );
};

const withMeta = <TData, TTotals>(
  report: string,
  dateField: string,
  filters: IReportFilters,
  warnings: IReportWarning[],
  totals: TTotals,
  data: TData[],
  metaFilters?: Record<string, unknown>
): IReportResult<TData, TTotals> => ({
  meta: {
    report,
    dateField,
    filters: { ...filters, ...metaFilters },
    generatedAt: new Date().toISOString(),
    notes: ["Datos simulados con REPORTS_MOCK=true"]
  },
  warnings,
  totals,
  data
});

const buildVolume = (filters: IReportFilters): IReportResult<IProductionVolumeRow, IProductionVolumeTotals> => {
  const rows = filterProductionRows(filters);
  const granularity = filters.granularity ?? "month";
  const subjectFactor = filters.subject === "feedstock" ? 0.82 : 1;
  const groups = new Map<string, { row: IProductionVolumeRow; orders: Set<string> }>();

  rows.forEach(row => {
    const period = periodStart(row.date, granularity);
    const key = `${period}|${row.lineId}|${row.shapeId}`;

    const current = groups.get(key) ?? {
      row: {
        period,
        lineId: row.lineId,
        lineName: row.line,
        categoryId: row.shapeId,
        categoryName: row.shape,
        kg: 0,
        ton: 0,
        orders: 0
      },
      orders: new Set<string>()
    };

    current.row.kg += row.kg * subjectFactor;
    current.orders.add(row.batch);
    groups.set(key, current);
  });

  const data = Array.from(groups.values())
    .map(({ row, orders }) => ({
      ...row,
      kg: round(row.kg),
      ton: round(row.kg / 1000),
      orders: orders.size
    }))
    .sort(
      (left, right) =>
        left.period.localeCompare(right.period) ||
        left.lineName.localeCompare(right.lineName, "es") ||
        left.categoryName.localeCompare(right.categoryName, "es")
    );

  const distinctOrders = new Set(rows.map(row => row.batch)).size;

  const totals = data.reduce(
    (result, row) => ({
      kg: round(result.kg + row.kg),
      ton: round(result.ton + row.ton),
      orders: distinctOrders
    }),
    { kg: 0, ton: 0, orders: distinctOrders }
  );

  return withMeta("production-volume", "kardex_final_product.date_created", filters, [], totals, data);
};

const buildComparison = (
  filters: IReportFilters
): IReportResult<IProductionComparisonRow, IProductionComparisonTotals> => {
  const granularity = filters.granularity === "week" ? "week" : "month";
  const unit = filters.unit === "kg" ? "kg" : filters.unit === "units" ? "units" : "ton";

  const previousFilters: IReportFilters = {
    ...filters,
    from: format(subYears(parseISO(filters.from), 1), "yyyy-MM-dd"),
    to: format(subYears(parseISO(filters.to), 1), "yyyy-MM-dd")
  };

  const periodKey = (period: string): string => {
    const date = parseISO(period);

    return granularity === "week"
      ? `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`
      : format(date, "yyyy-MM");
  };

  const currentPeriodFor = (period: string): string => {
    if (granularity === "week") {
      const date = parseISO(period);
      const week = getISOWeek(date);
      const weekYear = getISOWeekYear(date) + 1;
      const base = new Date(weekYear, 0, 4);

      return format(startOfWeek(setISOWeek(base, week), { weekStartsOn: 1 }), "yyyy-MM-dd");
    }

    return format(addYears(parseISO(period), 1), "yyyy-MM-dd");
  };

  const labelFor = (period: string): string =>
    granularity === "week"
      ? `W${String(getISOWeek(parseISO(period))).padStart(2, "0")}`
      : format(parseISO(period), "MM");

  const toValue = (kg: number): number => {
    if (unit === "ton") return round(kg / 1000);
    if (unit === "units") return round(kg / 0.5, 0);

    return round(kg);
  };

  const aggregate = (rows: typeof PRODUCTION_VOLUME_MOCK_ROWS): Map<string, { period: string; kg: number }> => {
    const result = new Map<string, { period: string; kg: number }>();

    rows.forEach(row => {
      const period = periodStart(row.date, granularity);
      const key = periodKey(period);
      const current = result.get(key) ?? { period, kg: 0 };

      current.kg += row.kg;
      result.set(key, current);
    });

    return result;
  };

  const buckets = new Map<string, { period: string; currentKg: number; previousKg: number }>();

  aggregate(filterProductionRows(filters)).forEach(({ period, kg }) => {
    const key = periodKey(period);

    buckets.set(key, { period, currentKg: kg, previousKg: 0 });
  });

  aggregate(filterProductionRows(previousFilters)).forEach(({ period, kg }) => {
    const currentPeriod = currentPeriodFor(period);
    const key = periodKey(currentPeriod);
    const current = buckets.get(key) ?? { period: currentPeriod, currentKg: 0, previousKg: 0 };

    current.previousKg = kg;
    buckets.set(key, current);
  });

  let currentCumulative = 0;
  let previousCumulative = 0;

  const data = Array.from(buckets.values())
    .sort((left, right) => left.period.localeCompare(right.period))
    .map(bucket => {
      const currentValue = toValue(bucket.currentKg);
      const previousValue = toValue(bucket.previousKg);

      currentCumulative = round(currentCumulative + currentValue);
      previousCumulative = round(previousCumulative + previousValue);

      return {
        period: bucket.period,
        periodLabel: labelFor(bucket.period),
        current: currentValue,
        previous: previousValue,
        currentCumulative,
        previousCumulative,
        variationPct: previousValue > 0 ? round((currentValue / previousValue - 1) * 100, 2) : null
      };
    });

  const totals = {
    current: round(data.reduce((total, row) => total + row.current, 0)),
    previous: round(data.reduce((total, row) => total + row.previous, 0)),
    variationPct: null as number | null
  };

  totals.variationPct = totals.previous > 0 ? round((totals.current / totals.previous - 1) * 100, 2) : null;

  const warnings: IReportWarning[] =
    totals.previous === 0
      ? [
          {
            code: "NO_PREVIOUS_YEAR_DATA",
            message: "No hay datos del año anterior para comparar."
          }
        ]
      : [];

  return withMeta("production-comparison", "kardex_final_product.date_created", filters, warnings, totals, data, {
    previousFrom: previousFilters.from,
    previousTo: previousFilters.to
  });
};

const buildMassBalance = (filters: IReportFilters): IReportResult<IMassBalanceRow, IMassBalanceTotals> => {
  const orders = filterMassOrders(filters);

  const data: IMassBalanceRow[] = orders.map(order => ({
    orderId: Number(order.id),
    batch: order.batch,
    closedAt: `${order.closeDate}T17:00:00-05:00`,
    products: order.productIds.map(productId => ({
      productId,
      productName: productMap.get(productId)?.name ?? productId
    })),
    lines: [{ lineId: order.lineId, lineName: order.line }],
    expectedKg: round(order.kgTheoretical),
    producedKg: round(order.kgProduced),
    lossKg: round(order.kgWaste),
    lossPct: round(order.wastePct, 2),
    yieldPct: round(order.yieldPct, 2),
    extraFeedstockKg: round(order.kgMpExtra)
  }));

  const totals = data.reduce(
    (result, row) => ({
      expectedKg: round(result.expectedKg + row.expectedKg),
      producedKg: round(result.producedKg + row.producedKg),
      lossKg: round(result.lossKg + row.lossKg),
      lossPct: 0,
      orders: result.orders + 1
    }),
    { expectedKg: 0, producedKg: 0, lossKg: 0, lossPct: 0, orders: 0 }
  );

  totals.lossPct = totals.expectedKg > 0 ? round((totals.lossKg / totals.expectedKg) * 100, 2) : 0;

  return withMeta("mass-balance", "orders.date_closed", filters, [], totals, data);
};

const buildCostPerKg = (filters: IReportFilters): IReportResult<ICostPerKgRow, ICostPerKgTotals> => {
  const rows = filterProductionRows(filters);
  const granularity = filters.granularity === "year" ? "year" : "month";
  const unit = filters.unit === "ton" ? "ton" : "kg";
  const cifTypeIds = toSet(filters.cifTypeIds);
  const groups = new Map<string, number>();

  rows.forEach(row => {
    const period = periodStart(row.date, granularity);

    groups.set(period, round((groups.get(period) ?? 0) + row.kg));
  });

  const data: ICostPerKgRow[] = Array.from(groups.entries())
    .map(([period, kg]) => {
      const seed = hash(period);
      const selectedTypes = CIF_TYPES.filter(type => matches(type.id, cifTypeIds));
      const cifIncomplete = seed % 4 === 0;
      const materialIncomplete = seed % 7 === 0;
      const feedstock = 9000 + (seed % 3500);
      const packaging = 2200 + (seed % 1600);

      const cifByType: ICostCifType[] = selectedTypes.map(type => ({
        typeId: type.id,
        typeName: type.name,
        copKg: cifIncomplete ? 0 : round(300 + ((seed * (type.id + 3)) % 1200))
      }));

      const cif = cifByType.reduce((total, item) => total + item.copKg, 0);
      const factor = unit === "ton" ? 1000 : 1;
      const total = feedstock + packaging + cif;

      return {
        period,
        kg,
        feedstockCopKg: round(feedstock * factor, 0),
        packagingCopKg: round(packaging * factor, 0),
        cifCopKg: round(cif * factor, 0),
        cifByType: cifByType.map(item => ({ ...item, copKg: round(item.copKg * factor, 0) })),
        totalCopKg: round(total * factor, 0),
        totalCopTon: round(total * 1000, 0),
        cifIncomplete,
        materialIncomplete
      };
    })
    .sort((left, right) => left.period.localeCompare(right.period));

  const totalKg = data.reduce((total, row) => total + row.kg, 0);

  const weighted = (selector: (row: ICostPerKgRow) => number): number =>
    totalKg > 0 ? round(data.reduce((total, row) => total + selector(row) * row.kg, 0) / totalKg, 0) : 0;

  const totalCopKg = weighted(row => row.totalCopKg);

  const totals: ICostPerKgTotals = {
    kg: round(totalKg),
    feedstockCopKg: weighted(row => row.feedstockCopKg),
    packagingCopKg: weighted(row => row.packagingCopKg),
    cifCopKg: weighted(row => row.cifCopKg),
    totalCopKg,
    totalCopTon: round(totalCopKg * 1000, 0)
  };

  const warnings: IReportWarning[] = [];

  if (data.some(row => row.cifIncomplete)) {
    warnings.push({
      code: "CIF_INCOMPLETE",
      message: "Los costos indirectos están incompletos: falta cerrar períodos CIF con kg producidos.",
      count: data.filter(row => row.cifIncomplete).length
    });
  }

  if (data.some(row => row.materialIncomplete)) {
    warnings.push({
      code: "MATERIAL_COST_INCOMPLETE",
      message: "Algún insumo no tenía costo al cerrar la orden.",
      count: data.filter(row => row.materialIncomplete).length
    });
  }

  const multiProductOrders = filterMassOrders(filters).filter(order => order.productIds.length > 1).length;

  if (multiProductOrders > 0) {
    warnings.push({
      code: "MULTI_PRODUCT_ORDER_COST",
      message: "En órdenes con varios productos el costo corresponde a la orden completa.",
      count: multiProductOrders
    });
  }

  return withMeta("production-cost-per-kg", "product_cost_snapshot.date_snapshot", filters, warnings, totals, data);
};

const buildTopProducts = (filters: IReportFilters): IReportResult<ITopProductRow, ITopProductTotals> => {
  const rows = filterProductionRows(filters);
  const origin = filters.origin;
  const productTotals = new Map<string, { kg: number; units: number; netSales: number }>();

  rows.forEach(row => {
    const current = productTotals.get(row.productId) ?? { kg: 0, units: 0, netSales: 0 };
    const unitWeight = 0.25 + (hash(row.productId) % 4) * 0.125;
    const price = 12000 + (hash(row.productId) % 24000);

    current.kg += row.kg;
    current.units += row.kg / unitWeight;
    current.netSales += row.kg * price;
    productTotals.set(row.productId, current);
  });

  const allProducts: ITopProductRow[] = Array.from(productTotals.entries()).map(([productId, value]) => {
    const product = productMap.get(productId);
    const originFactor = origin === "remision" ? 0.25 : 1;
    const kg = value.kg * originFactor;
    const units = Math.round(value.units * originFactor);

    return {
      rank: 0,
      productId,
      productName: product?.name ?? productId,
      lineName: product?.lineName ?? "Sin línea",
      categoryName: product?.categoryName ?? "Sin forma",
      units,
      kg: round(kg),
      netSales: round(value.netSales * originFactor, 0),
      valuedRemissionLines: origin === "siigo" ? 0 : 1 + (hash(productId) % 5)
    };
  });

  const metric = filters.metric ?? "cop";

  const sorted = [...allProducts].sort((left, right) => {
    if (metric === "kg") return right.kg - left.kg;
    if (metric === "units") return right.units - left.units;

    return right.netSales - left.netSales;
  });

  const data = sorted.slice(0, filters.top ?? 10).map((row, index) => ({ ...row, rank: index + 1 }));

  const totals = allProducts.reduce<ITopProductTotals>(
    (result, row) => ({
      units: result.units + row.units,
      kg: round(result.kg + row.kg),
      netSales: round(result.netSales + row.netSales, 0),
      products: result.products + 1
    }),
    { units: 0, kg: 0, netSales: 0, products: 0 }
  );

  const warnings: IReportWarning[] = [
    {
      code: "SALE_DATE_IS_UPLOAD_DATE",
      message:
        "La fecha de venta corresponde a la fecha de carga del archivo. Si el archivo se subió tarde, las ventas pueden aparecer en otro período."
    }
  ];

  if (origin !== "siigo") {
    warnings.push({
      code: "REMISSIONS_VALUED_AT_LIST_PRICE",
      message: "3 líneas de remisión se valorizaron con el precio de venta vigente.",
      count: 3
    });
    warnings.push({
      code: "REMISSIONS_WITHOUT_PRICE",
      message: "1 línea de remisión no tiene precio vigente y suma $0.",
      count: 1
    });
  }

  return withMeta("top-products", "sales.file_date", filters, warnings, totals, data);
};

export function getMockReport(endpoint: string, filters: IReportFilters): IReportResult<unknown, unknown> {
  switch (endpoint) {
    case "production/volume":
      return buildVolume(filters);
    case "production/comparison":
      return buildComparison(filters);
    case "production/mass-balance":
      return buildMassBalance(filters);
    case "production/cost-per-kg":
      return buildCostPerKg(filters);
    case "sales/top-products":
      return buildTopProducts(filters);
    default:
      throw new Error(`Reporte mock no implementado: ${endpoint}`);
  }
}

export function getMockReportFilters(): IReportFiltersCatalog {
  return {
    lines: PRODUCTION_VOLUME_META.lines,
    categories: PRODUCTION_VOLUME_META.shapes,
    products: products.map(product => ({
      id: product.id,
      name: product.name,
      lineId: product.lineId,
      categoryId: product.categoryId
    })),
    providers: PROVIDERS,
    origins: ORIGINS,
    cifTypes: CIF_TYPES.map(type => ({ id: type.id, name: type.name })),
    formulations,
    versions: formulations,
    uncategorized: { products: 0, feedstock: 0, packaging: 0 }
  };
}
