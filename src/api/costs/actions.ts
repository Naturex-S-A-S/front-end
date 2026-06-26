"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { ICostEstimate, ICostSnapshotSummary, IProductPrice, IPutCostConfig } from "@/types/pages/costs";

type ActionResult = { success: boolean; error?: string };

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
    const data = await apiFetch<ICostEstimate>(
      `costs/products/${productId}/estimate?quantityKg=${quantityKg}`
    );

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function saveCostEstimate(
  productId: string,
  quantityKg: number,
  notes: string
): Promise<{ success: true; data: { id: number } } | { success: false; error: string }> {
  try {
    const data = await apiFetch<{ id: number }>(
      `costs/products/${productId}/estimate?quantityKg=${quantityKg}&notes=${encodeURIComponent(notes)}`,
      { method: "POST" }
    );

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getProductSnapshotsAction(
  productId: string
): Promise<
  { success: true; data: ICostSnapshotSummary[] } | { success: false; error: string }
> {
  try {
    const data = await apiFetch<ICostSnapshotSummary[]>(`costs/products/${productId}/snapshots`);

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

export async function registerProductPrice(
  productId: string,
  data: {
    idSnapshot: number;
    costBase: number;
    wastePct: number;
    taxPct: number;
    finalPrice: number;
    notes: string;
  }
): Promise<ActionResult> {
  try {
    await apiFetch(`costs/products/${productId}/price`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidateTag(`costs-products-${productId}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCurrentPriceAction(
  productId: string
): Promise<{ success: true; data: IProductPrice | null }> {
  try {
    const data = await apiFetch<IProductPrice>(`costs/products/${productId}/price/current`);

    return { success: true, data };
  } catch {
    return { success: true, data: null };
  }
}

export async function getPriceHistoryAction(
  productId: string
): Promise<{ success: true; data: IProductPrice[] }> {
  try {
    const data = await apiFetch<IProductPrice[]>(`costs/products/${productId}/price/history`);

    return { success: true, data };
  } catch {
    return { success: true, data: [] };
  }
}
