import type { IAlert } from "@/types/alert";
import { apiFetch } from "../apiFetch";

export async function getAlertsServer(): Promise<IAlert[]> {
  try {
    return await apiFetch<IAlert[]>("alerts", { tags: ["alerts"] });
  } catch {
    return [];
  }
}

/* export async function getAllAlertsServer(page: number): Promise<IAlert[]> {
  try {
    return await apiFetch<IAlert[]>("alerts/all", { tags: ["alerts-all"], params: { page } });
  } catch {
    return [];
  }
} */
