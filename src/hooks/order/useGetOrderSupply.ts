import { useQuery, keepPreviousData } from "@tanstack/react-query"

import { getOrderSupply } from "@/api/order"
import type { IOrderSupplyList } from "@/types/pages/order"

interface IFilters {
    productId?: number
    status?: string
}

const useGetOrderSupply = (filters: IFilters) => {
    const { data, isLoading, isPlaceholderData } = useQuery<IOrderSupplyList[]>({
        queryKey: ["getOrderSupply", filters],
        queryFn: () => getOrderSupply(filters).then((rows: any[]) =>
            rows.map(r => ({ ...r, id: r.orderId }))
        ),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000
    })

    return { orderSupplies: data ?? [], isLoading, isPlaceholderData }
}

export default useGetOrderSupply
