"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { IPostCifType, IPostPeriod } from "@/types/pages/cif";

type ActionResult = { success: boolean; error?: string };

export async function createCifType(data: IPostCifType): Promise<ActionResult> {
  try {
    await apiFetch("costs/cif/types", {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidateTag("cif-types");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createPeriod(data: IPostPeriod): Promise<ActionResult> {
  try {
    await apiFetch("costs/cif/periods", {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidateTag("cif-periods");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateCifType(id: number, data: IPostCifType): Promise<ActionResult> {
  try {
    await apiFetch(`costs/cif/types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    revalidateTag("cif-types");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
