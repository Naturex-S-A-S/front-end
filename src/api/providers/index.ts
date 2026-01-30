import { API } from "../instances"

export const getProviders = async () => {
    const response = await API().get("/providers")

    return response.data
}

export const getProvidersList = async () => {
    const response = await API().get("/providers/list")

    return response.data
}
