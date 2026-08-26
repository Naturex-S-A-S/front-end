export interface ICostConfig {
  cifAveragingMonths: number;
  defaultWastePct: number;
  defaultMarginPct: number;
}

export type IPutCostConfig = ICostConfig;

export interface ICostEstimateMaterial {
  idMaterial: number;
  materialName: string;
  materialType: "feedstock" | "packaging";
  cost: number;
  baseQuantity: number | string;
  baseCost: number;
  stdQuantity: number;
  stdTotalCost: number;
  realUnitCost: number;
  realQuantity: number;
  realTotalCost: number; // = realUnitCost * units
}

export interface ICostEstimatePeriodCifItem {
  idCifType: number;
  name: string;
  costBasis: "fixed" | "per_kg";
  charge: number;
}

export interface ICostEstimatePeriod {
  idPeriod: number;
  name: string;
  totalCifAmount: number;
  totalKgProduced: number;
  cifRatePerKg: number;
  cifItems: ICostEstimatePeriodCifItem[];
}

export interface ICostEstimateCifDetail {
  id: number;
  name: string;
  amount: number;
  amountPerKg: number;
  totalAmount: number;
}

export interface ICostEstimateCifDetailInventory {
  id: number;
  name: string;
  inventoryTotalAmount: number;
}

export interface ICostEstimate {
  id: number | null;
  idFinalProduct: string;
  idOrder: number | null;
  idVersion: number;
  snapshotType: "estimation" | "order_close";
  status: "draft" | "completed" | "transient";
  units: number;
  quantityKg: number;
  unitGramsFinalProduct: number | null;
  realTotalCostFeedstock: number;
  realTotalCostPackaging: number;
  realCostMaterialUnit: number; // = realTotalCostFeedstock + realTotalCostPackaging
  costCifKg: number;
  wastePct: number;
  cifPeriodsUsed: number;
  dateSnapshot: string;
  nameUser: string;
  notes: string | null;
  materials: ICostEstimateMaterial[];
  periods: ICostEstimatePeriod[];
  cifDetails: ICostEstimateCifDetail[];
  totalCif: number;
  price: IProductPrice;
  totalCost: number;
  totalCostTax: number;
  totalCostWaste: number;
  wasteValue: number;
  taxValue: number;
  defaultMarginValue: number;
  defaultMarginPct: number;
  costDifference: number;
  utilityPct: number;
}

export interface IProductPrice {
  id: number | null;
  idFinalProduct: string;
  idSnapshot: number | null;
  commissionPct: number;
  commissionValue: number | null;
  suggestedPrice: number;
  utilityPct: number;
  costBase: number;
  costDifference: number;
  wastePct: number;
  taxPct: number;
  costWithWaste: number;
  wasteAmount: number;
  costWithTax: number;
  finalPrice: number;
  marginPct: number;
  marginAmount: number;
  marginWarning: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  nameUser: string | null;
  dateCreated: string | null;
  notes: string | null;
}

export interface ICostSnapshotMaterial {
  idMaterial: number;
  materialName: string;
  materialType: "feedstock" | "packaging";
  cost: number | null;
  baseQuantity: number | null;
  baseCost: number | null;
  stdQuantity: number | null;
  stdTotalCost: number | null;
  realUnitCost: number | null;
  realQuantity: number | null;
  realTotalCost: number | null;
}

export interface ICostSnapshotSummary {
  id: number;
  idFinalProduct: string;
  idOrder: number | null;
  idVersion: number;
  snapshotType: "estimation" | "order_close";
  status: "draft" | "completed" | "transient";
  quantityKg: number;
  units: number | null;
  unitGramsFinalProduct: number | null;
  realTotalCostFeedstock: number | null;
  realTotalCostPackaging: number | null;
  wastePct: number;
  costCifKg: number;
  totalCif: number | null;
  totalCost: number | null;
  wasteValue: number | null;
  totalCostWaste: number | null;
  defaultMarginPct: number | null;
  defaultMarginValue: number | null;
  totalCostTax: number | null;
  taxValue: number | null;
  cifPeriodsUsed: number;
  dateSnapshot: string;
  nameUser: string;
  notes: string | null;
  materials: ICostSnapshotMaterial[];
  periods: ICostEstimatePeriod[];
  cifDetails: ICostEstimateCifDetail[];
  price: IProductPrice | null;
}

export interface IProductInventorySummaryCifDetail {
  id: number;
  name: string;
  amount: number;
  amountPerKg: number;
  totalAmount: number;
  totalInventoryAmount: number;
}

export interface IProductInventorySummary {
  id: number;
  productId: string;
  productName: string;
  measurement: number;
  unit: string;
  productFullName: string;
  inventoryUnits: number;
  totalCostWithTax: number | null;
  wastePct: number | null;
  wasteValue: number | null;
  finalPrice: number | null;
  marginPct: number | null;
  marginAmount: number | null;
  totalInventoryCost: number | null;
  totalInventoryFinalPrice: number | null;
  totalInventoryCostWithTax: number | null;
  totalInventoryMarginAmount: number | null;
  totalInventoryKgProduced: number;
  cifDetails: IProductInventorySummaryCifDetail[];
}
