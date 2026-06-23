"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { IPostWarehouse, IPutWarehouse, IPostRack, IPutRack } from "@/types/pages/generalParameters";

export async function createWarehouse(data: IPostWarehouse) {
  try {
    await apiFetch("warehouses", {
      method: "POST",
      body: JSON.stringify(data),
      tags: ["warehouses"]
    });
    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateWarehouse(id: string, data: IPutWarehouse) {
  try {
    await apiFetch(`warehouses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      tags: ["warehouses"]
    });
    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await apiFetch(`warehouses/${id}`, {
      method: "DELETE"
    });
    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createRack(data: IPostRack) {
  try {
    await apiFetch("racks", {
      method: "POST",
      body: JSON.stringify(data)
    });

    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateRack(id: string, data: IPutRack) {
  try {
    await apiFetch(`racks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteRack(id: string) {
  try {
    await apiFetch(`racks/${id}`, {
      method: "DELETE"
    });
    revalidateTag("warehouses");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
