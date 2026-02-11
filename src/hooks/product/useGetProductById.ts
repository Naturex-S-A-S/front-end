import { useQuery } from "@tanstack/react-query";

import { getProduct } from "@/api/product";
import type { IProduct } from "@/types/pages/product";

const useGetProductById = (id: string) => {
    const { data, ...rest } = useQuery<IProduct | null>({
        queryKey: ['getProduct', id],
        queryFn: () => getProduct(id)
    })

    return {
        ...rest,
        product: data,
    }
}

export default useGetProductById;
