import { useQuery } from "@tanstack/react-query";

import { getWarehouses } from "@/api/general-parameters";

const useGetWarehouseList = () => {
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["warehouseList"],
    queryFn: getWarehouses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  return {
    warehouseList: data ?? [],
    isLoading: isLoading || isFetching,
    error
  };
};

export default useGetWarehouseList;
