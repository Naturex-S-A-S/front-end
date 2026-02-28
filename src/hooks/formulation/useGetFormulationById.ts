import { useQuery } from "@tanstack/react-query";

import { getFormulationById } from "@/api/formulation";
import type { IFormulation } from "@/types/pages/formulation";

const useGetFormulationById = (id: string) => {
    const { data, isLoading, isFetching, isRefetching } = useQuery<IFormulation | null>({
        queryKey: ['getFormulationById', Number(id)],
        queryFn: () => getFormulationById(id)
    })

    return {
        formulation: data,
        isLoading,
        isFetching,
        isRefetching
    }
}

export default useGetFormulationById;
