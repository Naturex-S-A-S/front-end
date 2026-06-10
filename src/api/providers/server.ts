import { apiFetch } from "@/api/apiFetch";
import type { IProvider } from "@/types/pages/financeAdministation";

export async function getProvidersServer(): Promise<IProvider[]> {
  try {
    return await apiFetch<IProvider[]>("providers", { tags: ["providers"] });
  } catch {
    return [];
  }
}
