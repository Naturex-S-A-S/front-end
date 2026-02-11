import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/api/product";
import type { IProduct } from "@/types/pages/product";

const useGetProduct = (filters?: any) => {
    const { data, isLoading } = useQuery<IProduct[]>({
        queryKey: ['getProducts', filters],
        queryFn: () => getProducts(filters)
    })

    return {
        product: data,
        isLoading
    }
}

export default useGetProduct;
