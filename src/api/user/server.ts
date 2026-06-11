import { apiFetch } from "@/api/apiFetch";
import type { IUser } from "@/types/pages/user";

export async function getUsersServer(): Promise<IUser[]> {
  try {
    return await apiFetch<IUser[]>("users", { tags: ["users"] });
  } catch {
    return [];
  }
}
