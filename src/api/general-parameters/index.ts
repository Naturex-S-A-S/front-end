import { API } from "../instances"

export const getCategories = async () => {
    const response = await API().get(`/general-parameters/category`)

    return response.data
}
