import { useQuery } from "@tanstack/react-query";

import { getCategoriesProduct } from "@/api/general-parameters/categories-product";

const useGetCategory = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["getCategoriesProduct"],
    queryFn: getCategoriesProduct
  });

  return {
    categories: categories || [],
    isLoading
  };
};

export default useGetCategory;
