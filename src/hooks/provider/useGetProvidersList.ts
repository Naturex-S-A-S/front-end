import { useQuery } from "@tanstack/react-query";

import { getProvidersList } from "@/api/providers";

const useGetProvidersList = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['providersList'],
        queryFn: getProvidersList,
        refetchOnWindowFocus: true
    })

    return {
        providersList: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetProvidersList;
