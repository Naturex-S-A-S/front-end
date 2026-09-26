import { useQuery } from "@tanstack/react-query";

import { getCategoriesLot } from "@/api/general-parameters/categories-lot";

const useGetLotCategory = () => {
  const { data: lotCategories, isLoading } = useQuery({
    queryKey: ["getCategoriesLot"],
    queryFn: getCategoriesLot
  });

  return {
    lotCategories: lotCategories || [],
    isLoading
  };
};

export default useGetLotCategory;