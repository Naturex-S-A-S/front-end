import { useQuery } from "@tanstack/react-query";

import { getProviders } from "@/api/providers";

const useGetProviders = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['getProviders'],
        queryFn: () => getProviders()
    })

    return {
        providers: data || [],
        isLoading
    }
}

export default useGetProviders;
