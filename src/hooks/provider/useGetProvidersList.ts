import { useQuery } from "@tanstack/react-query";

import { getProvidersList } from "@/api/providers";

const useGetProvidersList = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['providersList'],
        queryFn: getProvidersList,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    return {
        providersList: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetProvidersList;
