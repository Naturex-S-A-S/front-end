import { API } from "@/api/instances";

export const getCategoriesLot = async () => {
  const response = await API().get(`/categories/lot`);

  return response.data;
};

export const postCategoryLot = async (data: any) => {
  const response = await API().post(`/categories/lot`, data);

  return response.data;
};

export const putCategoryLot = async (id: string, data: any) => {
  const response = await API().put(`/categories/lot/${id}`, data);

  return response.data;
};

export const deleteCategoryLot = async (id: string) => {
  const response = await API().delete(`/categories/lot/${id}`);

  return response.data;
};