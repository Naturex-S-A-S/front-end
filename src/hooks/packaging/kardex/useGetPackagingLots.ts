import { useQuery } from "@tanstack/react-query";

import { getPackagingLots } from "@/api/packaging";
import type { IPackagingBatch } from "@/types/pages/inventory";

/** Lotes con saldo de un material de empaque: opciones del select del descarte. */
const useGetPackagingLots = (idPackaging?: string) => {
  const { data, isLoading, isFetching } = useQuery<IPackagingBatch[]>({
    queryKey: ["packagingLots", idPackaging],
    queryFn: () => getPackagingLots({ idPackaging: idPackaging as string, withStock: true }),
    enabled: !!idPackaging
  });

  return { lots: data ?? [], isLoading: isLoading || isFetching };
};

export default useGetPackagingLots;
