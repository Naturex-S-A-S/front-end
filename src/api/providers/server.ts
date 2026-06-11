import { apiFetch } from "@/api/apiFetch";
import type { IProvider } from "@/types/pages/financeAdministation";

export async function getProvidersServer(): Promise<IProvider[]> {
  try {
    return await apiFetch<IProvider[]>("providers", { tags: ["providers"] });
  } catch {
    return [];
  }
}

export async function getProviderByIdServer(id: string): Promise<IProvider | null> {
  try {
    return await apiFetch<IProvider>(`providers/${id}`, {
      tags: ["providers"]
    });
  } catch {
    return null;
  }
}
