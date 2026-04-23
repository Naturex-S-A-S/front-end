import { useQuery } from "@tanstack/react-query";

import { getSalesOrder } from "@/api/order";
import type { ISaleOrder } from "@/types/pages/saleOrder";

const useGetSalesOrder = () => {
    const { data, isLoading, error } = useQuery<ISaleOrder[]>({
        queryKey: ['getSalesOrder'],
        queryFn: getSalesOrder
    });

    return { salesOrder: data ?? [], isLoading, error }
}

export default useGetSalesOrder;
