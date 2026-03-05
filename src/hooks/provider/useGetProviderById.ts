import { useQuery } from "@tanstack/react-query";

import { getProviderById } from "@/api/providers";
import type { IProvider } from "@/types/pages/financeAdministation";

const useGetProviderById = (id: string) => {
    const { data, isLoading } = useQuery<IProvider>({
        queryKey: ['getProviderById', id],
        queryFn: () => getProviderById(id)
    })

    return {
        provider: data || null,
        isLoading
    }
}

export default useGetProviderById;
