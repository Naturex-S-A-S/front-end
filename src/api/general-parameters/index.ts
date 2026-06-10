import { API } from "../instances";

export const getCategories = async () => {
  const response = await API().get(`/categories`);

  return response.data;
};
