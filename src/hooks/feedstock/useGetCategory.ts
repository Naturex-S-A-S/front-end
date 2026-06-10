import { useQuery } from "@tanstack/react-query";

import { getCategoriesFeedstock } from "@/api/general-parameters/categories-feedstock";

const useGetCategory = () => {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['getCategories'],
        queryFn: getCategoriesFeedstock
    })

    return {
        categories: categories || [],
        isLoading
    }
}

export default useGetCategory;
