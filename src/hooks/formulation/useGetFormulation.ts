import { useQuery } from "@tanstack/react-query";

import { getFormulations } from "@/api/formulation";
import type { IFormulationAll } from "@/types/pages/formulation";

interface IFilters {
    product: any
}

const useGetFormulation = (filters: IFilters) => {
    const { data, isLoading } = useQuery<IFormulationAll[]>({
        queryKey: ["getFormulations", filters],
        queryFn: () => getFormulations(filters)
    })

    return { formulations: data || [], isLoading }
}

export default useGetFormulation;
