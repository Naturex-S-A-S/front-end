import type { ICategory, IPostCategory } from "@/types/pages/generalParameters"
import { API } from "../instances"

export const getCategories = async () => {
    const response = await API().get(`/general-parameters/category`)

    return response.data
}

export const postCategory = async (data: IPostCategory) => {
    const response = await API().post(`/general-parameters/category`, data)

    return response.data
}

export const putCategory = async (data: ICategory) => {
    const response = await API().put(`/general-parameters/category/${data.id}`, data)

    return response.data
}
