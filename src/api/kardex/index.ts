import { API } from "../instances"

export const getKardexMovements = async (params: any) => {
    const response = await API().get("/kardex/movements", {
        params: {
            ...params,
            kardexType: params?.kardexType?.value || undefined,
            providerId: params?.providerId?.id || undefined,
            batch: params.batch || undefined
        }
    })

    return response.data
}
