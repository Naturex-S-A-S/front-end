import { API } from "../instances"

export const postPackaging = async (data: any) => {
    const response = await API().post("/packaging", data)

    return response.data
}

export const postKardexInput = async (data: any) => {
    const response = await API().post("/kardex/packaging/input", data)

    return response.data
}

export const postKardexOutput = async (data: any) => {
    const response = await API().post("/kardex/packaging/output", data)

    return response.data
}

export const getPackaging = async (params: any) => {
    const response = await API().get("/packaging", { params })

    return response.data
}

export const getPackagingById = async (id: string) => {
    const response = await API().get(`/packaging/${id}`)

    return response.data
}

export const patchPackaging = async (id: number, data: any) => {
    const response = await API().patch(`/packaging/${id}`, data)

    return response.data
}

export const getCategories = async () => {
    const response = await API().get("/packaging/category")

    return response.data
}

export const getPackagingList = async () => {
    const response = await API().get("/packaging/list")

    return response.data
}
