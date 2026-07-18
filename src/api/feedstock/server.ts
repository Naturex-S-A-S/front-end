import { apiFetch } from "@/api/apiFetch";
import type { IFeedstock } from "@/hooks/feedstock/useGetFeedstockById";

export async function getFeedstockByIdServer(id: string): Promise<IFeedstock | null> {
  try {
    return await apiFetch<IFeedstock>(`feedstock/${id}`, { tags: [`feedstock/${id}`] });
  } catch {
    return null;
  }
}
