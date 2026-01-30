
import { useQuery } from "@tanstack/react-query";

import { getPackagingList } from "@/api/packaging";

const useGetPackagingList = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['packagingList'],
        queryFn: getPackagingList,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    return {
        packagingList: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetPackagingList;
