
import { useQuery } from "@tanstack/react-query";

import { getProductList } from "@/api/product";

const useGetProductList = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['productList'],
        queryFn: getProductList,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    return {
        productList: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetProductList;
