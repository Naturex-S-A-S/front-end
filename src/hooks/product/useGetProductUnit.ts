
import { useQuery } from "@tanstack/react-query";

import { getProductUnits } from "@/api/product";

const useGetProductUnit = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['getProductUnits'],
        queryFn: getProductUnits,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    return {
        units: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetProductUnit;
