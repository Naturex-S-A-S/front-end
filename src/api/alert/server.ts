import type { IAlert } from "@/types/alert";
import { apiFetch } from "../apiFetch";

export async function getAlertsServer(): Promise<IAlert[]> {
  try {
    return await apiFetch<IAlert[]>("alerts", { tags: ["alerts"] });
  } catch {
    return [];
  }
}

interface AlertsPageParams {
  onlyActive?: boolean;
}

export async function getAlertsPageServer(params?: AlertsPageParams): Promise<IAlert[]> {
  try {
    const path = params?.onlyActive ? "alerts?onlyActive=true" : "alerts";

    return await apiFetch<IAlert[]>(path, { tags: ["alerts"] });
  } catch {
    return [];
  }
}
