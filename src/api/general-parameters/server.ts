import type { IWarehouse } from "@/types/pages/generalParameters";
import { apiFetch } from "../apiFetch";

export async function getWarehousesServer(): Promise<IWarehouse[]> {
  try {
    return await apiFetch<IWarehouse[]>("warehouses", { tags: ["warehouses"] });
  } catch {
    return [];
  }
}
