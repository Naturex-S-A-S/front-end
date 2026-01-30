import { useQuery } from "@tanstack/react-query";

import { getFeedstockList } from "@/api/feedstock";

const useGetFeedstockList = () => {
    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ['feedstockList'],
        queryFn: getFeedstockList,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    return {
        feedstockList: data ?? [],
        isLoading: isLoading || isFetching,
        error
    }
}

export default useGetFeedstockList;
