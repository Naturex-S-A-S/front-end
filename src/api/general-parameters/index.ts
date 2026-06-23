import { API } from "../instances";
import type { IWarehouse } from "@/types/pages/generalParameters";

export const getCategories = async () => {
  const response = await API().get(`/categories`);

  return response.data;
};

export const getWarehouseById = async (id: string): Promise<IWarehouse> => {
  const response = await API().get(`/warehouses/${id}`);

  return response.data;
};

export const getWarehouses = async (): Promise<IWarehouse[]> => {
  const response = await API().get(`/warehouses`);

  return response.data;
};
