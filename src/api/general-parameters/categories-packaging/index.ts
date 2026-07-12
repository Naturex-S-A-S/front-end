import { API } from "@/api/instances";
import type { IPostCategory, IPutCategory } from "@/types/pages/generalParameters";

export const getCategoriesPackaging = async () => {
  const response = await API().get(`/categories/packaging`);

  return response.data;
};

export const postCategoryPackaging = async (data: IPostCategory) => {
  const response = await API().post(`/categories/packaging`, data);

  return response.data;
};

export const putCategoryPackaging = async (data: IPutCategory) => {
  const response = await API().put(`/categories/packaging/${data.id}`, {
    name: data.name
  });

  return response.data;
};

export const deleteCategoryPackaging = async (id: string) => {
  const response = await API().delete(`/categories/packaging/${id}`);

  return response.data;
};
