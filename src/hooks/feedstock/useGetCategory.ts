import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/api/feedstock";

const useGetCategory = () => {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['getCategories'],
        queryFn: getCategories
    })

    return {
        categories: categories || [],
        isLoading
    }
}

export default useGetCategory;
