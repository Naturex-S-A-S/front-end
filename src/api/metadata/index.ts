import { API } from "../instances"

export const getOrderStatuses = async () => {
    const response = await API().get("/metadata/order/statuses")

    return response.data
}

export const getFileTypes = async () => {
    const response = await API().get("/metadata/sales-order/file-types")

    return response.data
}
