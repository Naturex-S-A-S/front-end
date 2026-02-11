import type { ICreateProduct, IUpdateProduct } from "@/types/pages/product"
import { API } from "../instances"

export const postProduct = async (data: ICreateProduct) => {
    const response = await API().post("/product", data)

    return response.data
}

export const getProducts = async (filters?: any) => {
    const response = await API().get("/product", { params: filters })

    return response.data
}

export const getProduct = async (id: string) => {
    const response = await API().get(`/product/${id}`)

    return response.data
}

export const postKardexInput = async (data: any) => {
    const response = await API().post("/kardex/product/input", data)

    return response.data
}

export const postKardexOutput = async (data: any) => {
    const response = await API().post("/kardex/product/output", data)

    return response.data
}

export const putProduct = async (id: string, data: IUpdateProduct) => {
    const response = await API().put(`/product/${id}`, data)

    return response.data
}

export const getProductList = async () => {
    const response = await API().get("/product/list")

    return response.data
}

export const putActivateProduct = async (id: string) => {
    const response = await API().put(`/product/${id}/activate`)

    return response.data
}

export const putDeactivateProduct = async (id: string) => {
    const response = await API().put(`/product/${id}/deactivate`)

    return response.data
}

export const getMovements = async (params: any) => {
    const response = await API().get(`/product/movements`, {
        params: {
            type: params?.kardexType?.value || undefined,
            idProduct: params?.product?.id || undefined,
            batch: params.batch || undefined,
            classification: params?.classification || undefined,
            idOrder: params?.orderId || undefined,
        }
    })

    return response.data
}

export const getProductUnits = async () => {
    const response = await API().get("/metadata/product/unit")

    return response.data
}
