import { useQuery } from "@tanstack/react-query"

import { getOrderSupplyById } from "@/api/order"
import type { IOrderSupply } from "@/types/pages/order"

const useGetOrderSupplyById = (id: string) => {
    const { data, isLoading, isFetching, isRefetching } = useQuery<IOrderSupply | null>({
        queryKey: ['getOrderSupplyById', Number(id)],
        queryFn: () => getOrderSupplyById(id)
    })

    return {
        orderSupply: data,
        isLoading,
        isFetching,
        isRefetching
    }
}

export default useGetOrderSupplyById
