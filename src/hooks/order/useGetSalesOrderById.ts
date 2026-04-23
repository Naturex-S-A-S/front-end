import { useQuery } from '@tanstack/react-query'

import { getSalesOrderById } from '@/api/order'
import type { ISaleOrder } from '@/types/pages/saleOrder'

const useGetSalesOrderById = (id: string) => {
    const { data, isLoading } = useQuery<ISaleOrder | null>({
        queryKey: ['getSalesOrderById', id],
        queryFn: () => getSalesOrderById(id)
    })

    return { saleOrder: data, isLoading }
}

export default useGetSalesOrderById
