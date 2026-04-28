import type { IOrderCreate } from "@/types/pages/order"
import { API } from "../instances"

export const getOrderCalculate = async (data: any) => {
    const response = await API().get("/orders/calculate", {
        params: {
            baseProductId: data.baseProductId,
            productIds: data.productIds,
            quantities: data.quantities
        }
    })

    return response.data
}

export const postOrder = async (data: IOrderCreate) => {
    const response = await API().post("/orders", data)

    return response.data
}

export const getOrderById = async (id: string) => {
    const response = await API().get(`/orders/${id}`)

    return response.data
}

export const getOrders = async (params: any) => {
    const response = await API().get("/orders", { params })

    return response.data
}

export const postSaleOrderType1 = async (data: any) => {
    const response = await API().post("/sales-order/file/remision-venta", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

export const postSaleOrderType2 = async (data: any) => {
    const response = await API().post("/sales-order/file/ventas-siigo", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

export const getSalesOrder = async () => {
    const response = await API().get(`/sales-order`)

    return response.data
}

export const getSalesOrderById = async (id: string) => {
    const response = await API().get(`/sales-order/${id}`)

    return response.data
}

export const getOrderSupplyCalculate = async (data: any) => {
    const response = await API().get(`/orders/supply/calculate`, {
        params: {
            baseProductId: data.baseProductId,
            productIds: data.productIds,
            quantities: data.quantities
        }
    })

    return response.data
}

export const postOrderSupply = async (data: any) => {
    const response = await API().post(`/orders/supply`, data)

    return response.data
}

export const getOrderSupplyById = async (id: string) => {
    const response = await API().get(`/orders/supply/${id}`)

    return response.data
}

export const getOrderSupply = async (params: any) => {
    const response = await API().get(`/orders/supply`, { params })

    return response.data
}

export const patchStatusOrder = async (id: string, status: string) => {
    const response = await API().patch(`/orders/${id}/status`, { status })

    return response.data
}
