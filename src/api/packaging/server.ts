import { apiFetch } from "@/api/apiFetch";
import type { IPackaging } from "@/hooks/packaging/useGetPackagingById";

export async function getPackagingByIdServer(id: string): Promise<IPackaging | null> {
  try {
    return await apiFetch<IPackaging>(`packaging/${id}`, { tags: [`packaging/${id}`] });
  } catch {
    return null;
  }
}
