"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { ICostEstimate, IProductInventorySummary, IProductPrice, IPutCostConfig } from "@/types/pages/costs";

type ActionResult = { success: boolean; error?: string };

export type RegisterPricePayload = {
  idFinalProduct: string;
  units: number;
  wastePct: number;
  commissionPct: number;
  finalPrice: number;
  isDefinitive: boolean;
  notes: string;
  materials: {
    idMaterial: number;
    materialType: string;
    quantity: number | string;
    unitCost: number | null;
  }[];
};

export async function updateCostConfig(data: IPutCostConfig): Promise<ActionResult> {
  try {
    await apiFetch("costs/config", {
      method: "PUT",
      body: JSON.stringify(data)
    });
    revalidateTag("cost-config");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCostEstimateAction(
  productId: string,
  quantityKg: number
): Promise<{ success: true; data: ICostEstimate } | { success: false; error: string }> {
  try {
    const data = await apiFetch<ICostEstimate>(`costs/products/${productId}/estimate?quantityKg=${quantityKg}`);

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getProductSnapshotsAction(
  productId: string
): Promise<{ success: true; data: IProductInventorySummary[] } | { success: false; error: string }> {
  try {
    const data = await apiFetch<IProductInventorySummary[]>(`costs/products/${productId}/snapshots`);

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getSnapshotDetailAction(
  snapshotId: number
): Promise<{ success: true; data: ICostEstimate } | { success: false; error: string }> {
  try {
    const data = await apiFetch<ICostEstimate>(`costs/snapshots/${snapshotId}`);

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateSnapshotAction(
  productId: string,
  snapshotId: number,
  data: RegisterPricePayload
): Promise<ActionResult> {
  try {
    await apiFetch(`costs/products/${productId}/snapshots/${snapshotId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function registerProductPrice(productId: string, data: RegisterPricePayload): Promise<ActionResult> {
  try {
    await apiFetch(`costs/products/${productId}/save`, {
      method: "POST",
      body: JSON.stringify(data)
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCurrentPriceAction(productId: string): Promise<{ success: true; data: IProductPrice | null }> {
  try {
    const data = await apiFetch<IProductPrice>(`costs/products/${productId}/price/current`);

    return { success: true, data };
  } catch {
    return { success: true, data: null };
  }
}

export async function getPriceHistoryAction(productId: string): Promise<{ success: true; data: IProductPrice[] }> {
  try {
    const data = await apiFetch<IProductPrice[]>(`costs/products/${productId}/price/history`);

    return { success: true, data };
  } catch {
    return { success: true, data: [] };
  }
}
