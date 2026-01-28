import type { UpdatePasswordPayload, UpdateProfilePayload } from "@/types/pages/profile"
import { API } from "../instances"
import { ApiServer } from "../server"

export const getProfileServer = async (): Promise<any> => {
    return ApiServer('profile/me')
}

export const putProfile = async (data: UpdateProfilePayload) => {
    const response = await API().put("/profile/me", data)

    return response.data
}

export const putPassword = async (data: UpdatePasswordPayload) => {
    const response = await API().put("/profile/reset-password", data)

    return response.data
}
