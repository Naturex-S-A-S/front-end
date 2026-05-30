import { API } from "@/api/instances"
import type { IPostCategory, IPutCategory } from "@/types/pages/generalParameters"

export const getCategoriesFeedstock = async () => {
    const response = await API().get(`/categories/feedstock`)

    return response.data
}

export const postCategoryFeedstock = async (data: IPostCategory) => {
    const response = await API().post(`/categories/feedstock`, data)

    return response.data
}

export const putCategoryFeedstock = async (data: IPutCategory) => {
    const response = await API().put(`/categories/feedstock/${data.id}`, {
        name: data.name
    })

    return response.data
}
