import { useQuery } from "@tanstack/react-query";

import { getFeedstockLots } from "@/api/feedstock";
import type { IFeedstockBatch } from "@/types/pages/inventory";

/** Lotes vencidos con saldo de una materia prima: opciones del select del descarte. */
const useGetFeedstockLots = (idFeedstock?: string) => {
  const { data, isLoading, isFetching } = useQuery<IFeedstockBatch[]>({
    queryKey: ["feedstockLots", idFeedstock],
    queryFn: () => getFeedstockLots({ idFeedstock: idFeedstock as string, expired: true, withStock: true }),
    enabled: !!idFeedstock
  });

  return { lots: data ?? [], isLoading: isLoading || isFetching };
};

export default useGetFeedstockLots;
