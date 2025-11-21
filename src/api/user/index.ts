import { API } from "./instances"
import type { IAuthenticationData } from "./types"

export const authentication = async (data: IAuthenticationData) => {
    const response = await API().post("/auth/login", data)

    return response.data
}
