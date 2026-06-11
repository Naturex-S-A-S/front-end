import { apiFetch } from "@/api/apiFetch";
import type { IOrderList, IOrderSupply, IOrderSupplyList } from "@/types/pages/order";
import type { ISaleOrder } from "@/types/pages/saleOrder";

export async function getOrdersServer(params?: { productId?: string; status?: string }): Promise<IOrderList[]> {
  try {
    const sp = new URLSearchParams();

    if (params?.productId) sp.set("productId", params.productId);
    if (params?.status) sp.set("status", params.status);

    const qs = sp.toString();

    const data = await apiFetch<any[]>(`orders${qs ? `?${qs}` : ""}`, {
      tags: ["orders"]
    });

    return data.map(r => ({ ...r, id: r.orderId }));
  } catch {
    return [];
  }
}

export async function getSalesOrderServer(): Promise<ISaleOrder[]> {
  try {
    return await apiFetch<ISaleOrder[]>("sales-order", { tags: ["sales-order"] });
  } catch {
    return [];
  }
}

export async function getSalesOrderByIdServer(id: string): Promise<ISaleOrder | null> {
  try {
    return await apiFetch<ISaleOrder>(`sales-order/${id}`, { tags: ["sales-order"] });
  } catch {
    return null;
  }
}

export async function getOrderSupplyServer(params?: {
  productId?: string;
  status?: string;
}): Promise<IOrderSupplyList[]> {
  try {
    const sp = new URLSearchParams();

    if (params?.productId) sp.set("productId", params.productId);
    if (params?.status) sp.set("status", params.status);

    const qs = sp.toString();

    const data = await apiFetch<any[]>(`orders/supply${qs ? `?${qs}` : ""}`, {
      tags: ["orders-supply"]
    });

    return data.map(r => ({ ...r, id: r.orderId }));
  } catch {
    return [];
  }
}

export async function getOrderSupplyByIdServer(id: string): Promise<IOrderSupply | null> {
  try {
    return await apiFetch<IOrderSupply>(`orders/supply/${id}`, {
      tags: ["orders-supply"]
    });
  } catch {
    return null;
  }
}
