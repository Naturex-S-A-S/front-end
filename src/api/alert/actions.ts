"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";

export async function revalidateAlerts() {
  revalidateTag("alerts");
}

export async function markAlertAsRead(alertId: number) {
  try {
    await apiFetch(`alerts/${alertId}/status`, {
      method: "PUT",
      body: JSON.stringify({ readed: true }),
      tags: ["alerts"]
    });
    revalidateTag("alerts");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
