import type { IPacking, IPostPacking, IPutPacking } from "@/types/pages/packing";
import { API } from "../instances";

export const postPacking = async (data: IPostPacking) => {
  const response = await API().post("/packing", data);

  return response.data;
};

export const getPacking = async (): Promise<IPacking[]> => {
  const response = await API().get("/packing");

  return response.data;
};

export const putPackingProduct = async (data: IPutPacking) => {
  const { productId, ...rest } = data;

  const response = await API().put(`/packing/product/${productId}`, rest);

  return response.data;
};
