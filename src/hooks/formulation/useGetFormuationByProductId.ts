import { useQuery } from "@tanstack/react-query";

import { getFormulationByProductId } from "@/api/formulation";
import type { IFormulation } from "@/types/pages/formulation";

const useGetFormulationByProductId = (id: string) => {
    const { data, isLoading, isFetching, isRefetching } = useQuery<IFormulation[] | null>({
        queryKey: ['getFormulationByProductId', id],
        queryFn: () => getFormulationByProductId(id)
    })

    return {
        formulations: data || [],
        isLoading,
        isFetching,
        isRefetching
    }
}

export default useGetFormulationByProductId;
