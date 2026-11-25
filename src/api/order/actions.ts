"use server";

import { revalidateTag } from "next/cache";

import { apiFetch } from "@/api/apiFetch";
import type { IOrderCreate } from "@/types/pages/order";

export async function createOrder(data: IOrderCreate) {
  try {
    const result = await apiFetch<any>("orders", {
      method: "POST",
      body: JSON.stringify(data),
      tags: ["orders"]
    });

    revalidateTag("orders");

    return { success: true, orderId: result.orderId };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

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

export async function updateOrderSupplyStatus(orderSupplyId: number, status: string) {
  try {
    await apiFetch(`orders/supply/${orderSupplyId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      tags: [`order-supply-${orderSupplyId}`, "orders-supply"]
    });
    revalidateTag(`order-supply-${orderSupplyId}`);
    revalidateTag("orders-supply");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Las entradas de MP y ME se registran desde el cliente con axios; esto invalida el detalle del
 * aprovisionamiento (cacheado en el servidor con el tag orders-supply) para que muestre lo ingresado.
 */
export async function revalidateOrdersSupply() {
  revalidateTag("orders-supply");
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
