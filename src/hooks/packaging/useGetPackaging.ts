import { useQuery } from "@tanstack/react-query";

import { getPackaging } from "@/api/packaging";

const useGetPackaging = (filters: any) => {
    const { data, isLoading } = useQuery({
        queryKey: ['getPackaging', filters],
        queryFn: () => getPackaging(filters || { active: true })
    })

    return {
        packaging: data,
        isLoading
    }
}

export default useGetPackaging;
