import { API } from "../instances"

export const postFeedstock = async (data: any) => {
    const response = await API().post("/feedstock", data)

    return response.data
}

export const postKardexInput = async (data: any) => {
    const response = await API().post("/kardex/feedstock/input", data)

    return response.data
}
