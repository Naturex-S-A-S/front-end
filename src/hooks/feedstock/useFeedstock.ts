import { useQuery } from "@tanstack/react-query";

import { getFeedstock } from "@/api/feedstock";

const useFeedstock = (filters?: any) => {
    const { data, isLoading } = useQuery({
        queryKey: ['getFeedstock', filters],
        queryFn: () => getFeedstock(filters || { active: true })
    })

    return {
        feedstock: data,
        isLoading
    }
}

export default useFeedstock;
