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

export interface ICostEstimate {
  id: number;
  idFinalProduct: string;
  idOrder: number | null;
  idVersion: number;
  snapshotType: "estimation" | "order_close";
  status: "draft" | "completed" | "transient";
  units: number;
  quantityKg: number;
  unitGramsFinalProduct: number | null;
  baseTotalCostFeedstock: number;
  baseTotalCostPackaging: number;
  stdTotalCostFeedstock: number;
  stdTotalCostPackaging: number;
  stdCostMaterialKg: number;
  stdCostMaterialTon: number;
  stdCostMaterialUnit: number;
  realTotalCostFeedstock: number;
  realTotalCostPackaging: number;
  realCostMaterialKg: number;
  realCostMaterialTon: number;
  realCostMaterialUnit: number; // = realTotalCostFeedstock + realTotalCostPackaging
  costVariationKg: number | null;
  costCifKg: number;
  costCifTon: number;
  costCifUnit: number;
  costTotalKg: number;
  costTotalTon: number;
  costTotalUnit: number;
  wastePct: number;
  cifAveragingMonths: number;
  cifPeriodsUsed: number;
  cifIncomplete: boolean;
  materialIncomplete: boolean;
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
  taxPct: number;
  defaultMarginValue: number;
  defaultMarginPct: number;
  costDifference: number;
  utilityPct: number;
}

export interface IProductPrice {
  id: number;
  idFinalProduct: string;
  idSnapshot: number;
  commissionPct: number;
  commissionValue: number;
  suggestedPrice: number;
  utilityPct: number;
  costBase: number;
  wastePct: number;
  taxPct: number;
  costWithWaste: number;
  costWithTax: number;
  finalPrice: number;
  marginPct: number;
  marginWarning: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  nameUser: string;
  dateCreated: string;
  notes: string | null;
}

export interface ICostSnapshotSummary {
  id: number;
  idFinalProduct: string;
  snapshotType: "estimation" | "order_close";
  status: "draft" | "completed" | "transient";
  quantityKg: number;
  costTotalKg: number;
  costTotalTon: number;
  costTotalUnit: number;
  dateSnapshot: string;
  nameUser: string;
  notes: string | null;
}
