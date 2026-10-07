"use client";

import { useQuery } from "@tanstack/react-query";

import { getFeedstockPrices, getPackagingPrices } from "@/api/costs/prices";

const useMaterialPrices = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cost-material-prices"],
    queryFn: async () => {
      const [feedstock, packaging] = await Promise.all([getFeedstockPrices(), getPackagingPrices()]);

      return { feedstock, packaging };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  return {
    feedstockPrices: data?.feedstock ?? [],
    packagingPrices: data?.packaging ?? [],
    isLoading: isLoading || isFetching
  };
};

export default useMaterialPrices;
