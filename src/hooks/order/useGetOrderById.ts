import { useQuery } from "@tanstack/react-query"

import { getOrderById } from "@/api/order"
import type { IOrder } from "@/types/pages/order"

const useGetOrderById = (id: string) => {
    const { data, isLoading, isFetching, isRefetching } = useQuery<IOrder | null>({
        queryKey: ['getOrderById', Number(id)],
        queryFn: () => getOrderById(id)
    })

    return {
        order: data,
        isLoading,
        isFetching,
        isRefetching
    }
}

export default useGetOrderById
