import { useQuery } from "@tanstack/react-query";

import { getCategoriesPackaging } from "@/api/general-parameters/categories-packaging";

const useGetCategory = () => {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['getCategoriesPackaging'],
        queryFn: getCategoriesPackaging
    })

    return {
        categories: categories || [],
        isLoading
    }
}

export default useGetCategory;
