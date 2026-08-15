import type { ICostEstimate } from "@/types/pages/costs";
import type { RegisterPriceMaterialInput } from "@/utils/schemas/costs";

export const mapMaterialsToPriceInput = (estimate: ICostEstimate): RegisterPriceMaterialInput[] =>
  estimate.materials.map(m => ({
    idMaterial: m.idMaterial,
    materialType: m.materialType,
    quantity: m.baseQuantity,
    unitCost: m.realUnitCost
  }));

export const applyMaterialQuantityChange = (estimate: ICostEstimate, index: number, value: string): ICostEstimate => {
  const updated = structuredClone(estimate);
  const material = updated.materials[index];

  material.baseQuantity = value;
  material.baseCost = (parseFloat(material.baseQuantity) || 0) * (material.cost || 0);
  material.realUnitCost = (material.baseCost / 100) * (updated.unitGramsFinalProduct || 0);

  let totalFeedstockCost = 0;
  let totalPackagingCost = 0;

  for (const m of updated.materials) {
    if (m.materialType === "feedstock") {
      totalFeedstockCost += m.stdTotalCost;
    } else {
      totalPackagingCost += m.stdTotalCost;
    }
  }

  const totalMaterialCost = totalFeedstockCost + totalPackagingCost;
  const qty = updated.quantityKg;

  updated.stdCostFeedstockKg = totalFeedstockCost / qty;
  updated.stdCostPackagingKg = totalPackagingCost / qty;
  updated.stdCostMaterialKg = totalMaterialCost / qty;
  updated.stdCostMaterialTon = updated.stdCostMaterialKg * 1000;
  updated.stdCostMaterialUnit = updated.stdCostMaterialKg;

  updated.costTotalKg = updated.stdCostMaterialKg + updated.costCifKg;
  updated.costTotalTon = updated.costTotalKg * 1000;
  updated.costTotalUnit = updated.stdCostMaterialUnit + updated.costCifUnit;

  return updated;
};
