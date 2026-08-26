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
