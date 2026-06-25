"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { IItemPeriod, IPostCifType, IPostPeriod } from "@/types/pages/cif";

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
    revalidateTag(`cif-periods`);

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

//POST /api/costs/cif/periods/{id}/copy-template — Copiar ítems del período anterior
export async function copyTemplatePeriod(id: number): Promise<any> {
  try {
    return await apiFetch<any>(`costs/cif/periods/${id}/copy-template`, {
      method: "POST"
    });
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

interface IItemInPeriod {
  idCifType: number;
  amount: number;
  description: string;
}

export async function addItemToPeriod(id: number, item: IItemInPeriod): Promise<IItemPeriod | null> {
  try {
    const created = await apiFetch<IItemPeriod>(`costs/cif/periods/${id}/items`, {
      method: "POST",
      body: JSON.stringify(item)
    });

    revalidateTag(`cif-periods-${id}`);

    return created;
  } catch (e: any) {
    return null;
  }
}

//PUT /api/costs/cif/periods/{periodId}/items/{itemId} — Corregir un ítem (solo si período está abierto)
export async function updateItemInPeriod(periodId: number, itemId: number, item: IItemInPeriod): Promise<ActionResult> {
  try {
    await apiFetch(`costs/cif/periods/${periodId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(item)
    });
    revalidateTag(`cif-periods-${periodId}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

//DELETE /api/costs/cif/periods/{periodId}/items/{itemId} — Eliminar ítem (solo si período abierto)
export async function deleteItemInPeriod(periodId: number, itemId: number): Promise<ActionResult> {
  try {
    await apiFetch(`costs/cif/periods/${periodId}/items/${itemId}`, {
      method: "DELETE"
    });

    revalidateTag(`cif-periods-${periodId}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

//POST /api/costs/cif/periods/{id}/close — Cerrar el período
export async function closePeriod(id: number): Promise<ActionResult> {
  try {
    await apiFetch(`costs/cif/periods/${id}/close`, {
      method: "POST"
    });

    revalidateTag("cif-periods");
    revalidateTag(`cif-periods-${id}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
