import type { DummyMaterialsPayload, ICostConfig, ICostEstimate, IDummySimulationRow } from "@/types/pages/costs";
import type { RegisterPriceMaterialInput } from "@/utils/schemas/costs";

export const mapMaterialsToPriceInput = (estimate: ICostEstimate): RegisterPriceMaterialInput[] =>
  estimate.materials.map(m => ({
    idMaterial: m.idMaterial,
    materialType: m.materialType,
    quantity: m.baseQuantity,
    unitCost: m.cost
  }));

export const applyMaterialQuantityChange = (estimate: ICostEstimate, index: number, value: string): ICostEstimate => {
  const updated = structuredClone(estimate);
  const material = updated.materials[index];

  material.baseQuantity = value;
  material.baseCost = parseFloat(material.baseQuantity) * material.cost;
  material.realUnitCost = (material.baseCost / 100) * (updated.unitGramsFinalProduct || 0);
  material.realTotalCost = material.realUnitCost * estimate.units;

  let totalFeedstockCost = 0;
  let totalPackagingCost = 0;

  for (const m of updated.materials) {
    if (m.materialType === "feedstock") {
      totalFeedstockCost += m.realTotalCost;
    } else {
      totalPackagingCost += m.realTotalCost;
    }
  }

  updated.realTotalCostFeedstock = totalFeedstockCost;
  updated.realTotalCostPackaging = totalPackagingCost;
  updated.realCostMaterialUnit = totalFeedstockCost + totalPackagingCost;
  updated.totalCost = updated.realCostMaterialUnit + updated.totalCif;

  return updated;
};

const toNumber = (value: number | string): number => {
  const n = typeof value === "number" ? value : parseFloat(value);

  return Number.isFinite(n) ? n : 0;
};

// Misma fórmula del backend (ProductCostUseCase): el margen se calcula sobre el
// precio final, por lo que se divide por (1 - margen). Un margen de 100% o más
// divide por cero o da negativo, así que se sanea a 0.
export const computeMarginValue = (totalCostWaste: number, marginPct: number): number => {
  const pct = marginPct / 100;

  if (!Number.isFinite(totalCostWaste) || !Number.isFinite(pct) || pct <= 0 || pct >= 1) return 0;

  return (totalCostWaste * pct) / (1 - pct);
};

export const createEmptySimulation = (
  product: { id: string; isTestProduct?: boolean },
  config?: Partial<ICostConfig>
): ICostEstimate => {
  const now = new Date().toISOString();
  const marginPct = config?.defaultMarginPct ?? 0;

  return {
    id: null,
    idFinalProduct: product.id,
    idOrder: null,
    idVersion: 1,
    snapshotType: "estimation",
    status: "draft",
    units: 1,
    quantityKg: 1,
    unitGramsFinalProduct: null,
    unitGramsFinalProductUsed: null,
    realTotalCostFeedstock: 0,
    realTotalCostPackaging: 0,
    realCostMaterialUnit: 0,
    costCifKg: 0,
    wastePct: config?.defaultWastePct ?? 0,
    cifPeriodsUsed: 0,
    dateSnapshot: now,
    nameUser: "",
    notes: null,
    materials: [],
    periods: [],
    cifDetails: [],
    totalCif: 0,
    price: {
      id: 0,
      idFinalProduct: product.id,
      idSnapshot: null,
      commissionPct: 0,
      commissionValue: null,
      suggestedPrice: 0,
      utilityPct: 0,
      costBase: 0,
      costDifference: 0,
      wastePct: 0,
      taxPct: 0,
      costWithWaste: 0,
      wasteAmount: 0,
      costWithTax: 0,
      finalPrice: 0,
      marginPct: 0,
      marginAmount: 0,
      marginWarning: false,
      effectiveFrom: null,
      effectiveTo: null,
      nameUser: null,
      dateCreated: now,
      notes: null
    },
    totalCost: 0,
    totalCostTax: 0,
    totalCostWaste: 0,
    wasteValue: 0,
    taxValue: 0,
    defaultMarginValue: computeMarginValue(0, marginPct),
    defaultMarginPct: marginPct,
    costDifference: 0,
    utilityPct: 0
  };
};

export const isDummyRowComplete = (row: IDummySimulationRow): boolean =>
  Boolean(row.idMaterial) &&
  Boolean(row.materialName.trim()) &&
  toNumber(row.unitCost) > 0 &&
  toNumber(row.quantity) > 0;

export const buildDummyMaterialsPayload = (rows: IDummySimulationRow[]): DummyMaterialsPayload =>
  rows.filter(isDummyRowComplete).map(row => ({
    idMaterial: row.idMaterial,
    materialType: row.materialType,
    materialName: row.materialName,
    quantity: toNumber(row.quantity),
    unitCost: toNumber(row.unitCost)
  }));

export const applyCifOverride = (estimate: ICostEstimate, override: number | null): ICostEstimate => {
  if (override === null) return estimate;

  return {
    ...estimate,
    totalCif: override,
    totalCost: estimate.realCostMaterialUnit + override
  };
};
