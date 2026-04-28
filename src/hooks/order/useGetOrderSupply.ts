import { useQuery } from "@tanstack/react-query"

import { getOrderSupply } from "@/api/order"
import type { IOrderSupplyList } from "@/types/pages/order"

interface IFilters {
    productId?: number
    status?: string
}

const useGetOrderSupply = (filters: IFilters) => {
    const { data, isLoading } = useQuery<IOrderSupplyList[]>({
        queryKey: ["getOrderSupply", filters],
        queryFn: () => getOrderSupply(filters).then((rows: any[]) =>
            rows.map(r => ({ ...r, id: r.orderId }))
        )
    })

    return { orderSupplies: data ?? [], isLoading }
}

export default useGetOrderSupply
