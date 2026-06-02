import { useQuery } from "@tanstack/react-query"

import { getPacking } from "@/api/packing"
import type { IPacking } from "@/types/pages/packing"

export const useGetPacking = () => {
    const { data, isLoading } = useQuery<IPacking[]>({
        queryKey: ['getPackings'],
        queryFn: getPacking
    })

    return { data, isLoading }
}
