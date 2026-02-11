
import { useQuery } from "@tanstack/react-query";

import { getProductUnits } from "@/api/product";

const useGetProductUnit = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['getProductUnits'],
        queryFn: getProductUnits,
    })

    return {
        units: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetProductUnit;
