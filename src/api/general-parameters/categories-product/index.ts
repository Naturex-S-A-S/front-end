import { API } from "@/api/instances";
import type { IPostCategory, IPutCategory } from "@/types/pages/generalParameters";

export const getCategoriesProduct = async () => {
  const response = await API().get(`/categories/product`);

  return response.data;
};

export const postCategoryProduct = async (data: IPostCategory) => {
  const response = await API().post(`/categories/product`, data);

  return response.data;
};

export const putCategoryProduct = async (data: IPutCategory) => {
  const response = await API().put(`/categories/product/${data.id}`, {
    name: data.name
  });

  return response.data;
};

export const deleteCategoryProduct = async (id: string) => {
  const response = await API().delete(`/categories/product/${id}`);

  return response.data;
};
