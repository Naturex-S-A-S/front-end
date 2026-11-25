import { useQuery } from "@tanstack/react-query";

import { getOrderDetailLots } from "@/api/order";
import type { IOrderDetailLots } from "@/types/pages/order";

/** Lotes que la orden consumió de un material y todavía se pueden devolver. */
const useGetOrderDetailLots = (orderId: number, idMaterial?: string, enabled = true) => {
  const { data, isLoading, isFetching } = useQuery<IOrderDetailLots>({
    queryKey: ["orderDetailLots", orderId, idMaterial],
    queryFn: () => getOrderDetailLots(orderId, idMaterial as string),
    enabled: enabled && !!idMaterial
  });

  return { lots: data?.lots ?? [], isLoading: isLoading || isFetching };
};

export default useGetOrderDetailLots;
