import { useQuery } from "@tanstack/react-query";

import { getProviders } from "@/api/providers";
import type { IProvider } from "@/types/pages/financeAdministation";

const useGetProviders = () => {
    const { data, isLoading } = useQuery<IProvider[]>({
        queryKey: ['getProviders'],
        queryFn: () => getProviders()
    })

    return {
        providers: data || [],
        isLoading
    }
}

export default useGetProviders;
