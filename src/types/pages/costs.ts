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
  stdQuantity: number;
  stdUnitCost: number;
  stdTotalCost: number;
  realQuantity: number | null;
  realTotalCost: number | null;
}

export interface ICostEstimateCifItem {
  idCifType: number;
  cifTypeName: string;
  stdCost: number;
  realCost: number | null;
}

export interface ICostEstimate {
  id: number | null;
  idFinalProduct: string;
  idOrder: string | null;
  idVersion: number;
  snapshotType: string;
  status: string;
  quantityKg: number;
  stdCostFeedstockKg: number;
  stdCostPackagingKg: number;
  stdCostMaterialKg: number;
  stdCostMaterialTon: number;
  stdCostMaterialUnit: number;
  realCostFeedstockKg: number | null;
  realCostPackagingKg: number | null;
  realCostMaterialKg: number | null;
  realCostMaterialUnit: number | null;
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
  cifItems: ICostEstimateCifItem[];
}

export interface IProductPrice {
  id: number;
  idFinalProduct: string;
  idSnapshot: number;
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
