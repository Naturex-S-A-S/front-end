"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";

export async function updateOrderStatus(orderId: number, status: string) {
  try {
    await apiFetch(`orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      tags: [`order-${orderId}`]
    });
    revalidateTag(`order-${orderId}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createOrderSupply(data: any) {
  try {
    const result = await apiFetch<any>("orders/supply", {
      method: "POST",
      body: JSON.stringify(data),
      tags: ["orders-supply"]
    });

    revalidateTag("orders-supply");

    return { success: true, id: result.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
