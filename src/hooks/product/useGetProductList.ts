import { useQuery } from "@tanstack/react-query";

import { getProductList } from "@/api/product";
import type { IParamsListProduct } from "@/types/pages/product";

const useGetProductList = (params: IParamsListProduct) => {
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["productList", params],
    queryFn: () => getProductList(params)
  });

  return {
    productList: data ?? [],
    isLoading: isLoading || isFetching,
    error
  };
};

export default useGetProductList;
