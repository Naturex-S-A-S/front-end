"use client";

import { useQuery } from "@tanstack/react-query";

import { API } from "@/api/instances";
import type { ICostConfig } from "@/types/pages/costs";

const useCostConfig = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cost-config"],
    queryFn: async () => {
      const response = await API().get("/costs/config");

      return response.data as ICostConfig;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  return {
    costConfig: data ?? null,
    isLoading: isLoading || isFetching
  };
};

export default useCostConfig;
