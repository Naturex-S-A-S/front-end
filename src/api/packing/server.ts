import { apiFetch } from "@/api/apiFetch";
import type { IPacking } from "@/types/pages/packing";

export async function getPackingServer(): Promise<IPacking[]> {
  try {
    return await apiFetch<IPacking[]>("packing", { tags: ["packings"] });
  } catch {
    return [];
  }
}
