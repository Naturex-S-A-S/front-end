import type { IAlert } from "@/types/alert"
import { apiFetch } from "../apiFetch"

export async function getAlertsUserServer(): Promise<IAlert[]> {
  try {
    return await apiFetch<IAlert[]>("alerts/user", { tags: ["alerts"] })
  } catch {
    return []
  }
}