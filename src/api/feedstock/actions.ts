"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";

type ActionResult = { success: boolean; error?: string };

export async function toggleFeedstockActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await apiFetch(`feedstock/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active })
    });
    revalidateTag(`feedstock/${id}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
