"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { IPutCostConfig } from "@/types/pages/costs";

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
