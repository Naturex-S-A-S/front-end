import { useQuery } from "@tanstack/react-query";

import { getOpenSupplyOrders } from "@/api/order";
import type { IOpenSupplyOrder } from "@/types/pages/order";

export type SupplyMaterialType = "materia_prima" | "packaging";

/** Aprovisionamientos en proceso que piden el material. Solo consulta cuando hay un material elegido. */
const useGetOpenSupplyOrders = (materialId: string | undefined, type: SupplyMaterialType) => {
  const { data, isLoading, isFetching } = useQuery<IOpenSupplyOrder[]>({
    queryKey: ["openSupplyOrders", type, materialId],
    queryFn: () => getOpenSupplyOrders(materialId as string, type),
    enabled: !!materialId
  });

  return { openOrders: data ?? [], isLoading: !!materialId && (isLoading || isFetching) };
};

export default useGetOpenSupplyOrders;
