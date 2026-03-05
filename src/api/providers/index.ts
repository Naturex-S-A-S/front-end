import type { IPostProvider } from "@/types/pages/financeAdministation";
import { API } from "../instances"

export const postProvider = async (providerData: IPostProvider) => {
    const response = await API().post("/providers", providerData)

    return response.data
};

export const getProviders = async () => {
    const response = await API().get("/providers")

    return response.data
};

export const getProviderById = async (id: string) => {
    const response = await API().get(`/providers/${id}`)

    return response.data
};

export const getProvidersList = async () => {
    const response = await API().get("/providers/list")

    return response.data
};
