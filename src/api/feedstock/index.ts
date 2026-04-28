import { API } from "../instances"

export const postFeedstock = async (data: any) => {
    const response = await API().post("/feedstock", data)

    return response.data
}

export const postKardexInput = async (data: any) => {
    const response = await API().post("/kardex/feedstock/input", data)

    return response.data
}

export const postKardexOutput = async (data: any) => {
    const response = await API().post("/kardex/feedstock/output", data)

    return response.data
}

export const getFeedstock = async (params?: any) => {
    const response = await API().get("/feedstock", {
        params: {
            active: params?.active,
            allergen: params?.allergen,
            category: params?.category
        }
    })

    return response.data
}

export const getFeedstockById = async (id: string) => {
    const response = await API().get(`/feedstock/${id}`)

    return response.data
}

export const patchFeedstock = async (id: number, data: any) => {
    const response = await API().patch(`/feedstock/${id}`, data)

    return response.data
}

export const getCategories = async () => {
    const response = await API().get("/feedstock/category")

    return response.data
}

export const getFeedstockList = async () => {
    const response = await API().get("/feedstock/list")

    return response.data
}

export const postKardexInputAdjustment = async (data: any) => {
    const response = await API().post("/kardex/feedstock/input/adjustment", data)

    return response.data
}

export const postKardexOutputAdjustment = async (data: any) => {
    const response = await API().post("/kardex/feedstock/output/adjustment", data)

    return response.data
}
