import type { IPostFormulation, IPostFormulationVersion, IAddProductsToFormulation } from "@/types/pages/formulation";
import { API } from "../instances";

export const postFormulation = async (data: IPostFormulation) => {
  const response = await API().post("/formulations", data);

  return response.data;
};

export const postFormulationVersion = async (data: IPostFormulationVersion) => {
  const response = await API().post(`/formulations/version`, data);

  return response.data;
};

export const getFormulationById = async (id: string) => {
  const response = await API().get(`/formulations/${id}`);

  return response.data;
};

export const getFormulationByProductId = async (productId: string) => {
  const response = await API().get(`/formulations/product/${productId}`);

  return response.data;
};

export const getFormulations = async (params: any) => {
  const response = await API().get(`/formulations`, {
    params: {
      productId: params.productId
    }
  });

  return response.data;
};

export const putActivateFormulationVersion = async (id: number, version: number) => {
  const response = await API().put(`/formulations/${id}/version/${version}/activate`);

  return response.data;
};

export const postProductsToFormulation = async (formulationId: number, data: IAddProductsToFormulation) => {
  const response = await API().post(`/formulations/${formulationId}/products`, data);

  return response.data;
};

export const deleteProductFromFormulation = async (formulationId: number, productId: string) => {
  const response = await API().delete(`/formulations/${formulationId}/products/${productId}`);

  return response.data;
};
