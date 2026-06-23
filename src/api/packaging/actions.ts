"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";

type ActionResult = { success: boolean; error?: string };

export async function togglePackagingActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await apiFetch(`packaging/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active })
    });
    revalidateTag(`packaging/${id}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
