import { useQuery } from "@tanstack/react-query"

import { getOrders } from "@/api/order"
import type { IOrderList } from "@/types/pages/order"

interface IFilters {
    batch?: string
    status?: string
}

const useGetOrders = (filters: IFilters) => {
    const { data, isLoading } = useQuery<IOrderList[]>({
        queryKey: ["getOrders", filters],
        queryFn: () => getOrders(filters).then((rows: any[]) =>
            rows.map(r => ({ ...r, id: r.orderId }))
        )
    })

    return { orders: data ?? [], isLoading }
}

export default useGetOrders
