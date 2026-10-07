import { API } from "@/api/instances";
import type { IMaterialPriceOption } from "@/types/pages/costs";

export const getFeedstockPrices = async (): Promise<IMaterialPriceOption[]> => {
  const response = await API().get("/costs/feedstock/list");

  return response.data;
};

export const getPackagingPrices = async (): Promise<IMaterialPriceOption[]> => {
  const response = await API().get("/costs/packaging/list");

  return response.data;
};
