import type { UpdatePasswordPayload, UpdateProfilePayload } from "@/types/pages/profile"
import { API } from "../instances"

export const getProfile = async () => {
    const response = await API().get("/profile/me")

    return response.data
}

export const putProfile = async (data: UpdateProfilePayload) => {
    const response = await API().put("/profile/me", data)

    return response.data
}

export const putPassword = async (data: UpdatePasswordPayload) => {
    const response = await API().put("/profile/reset-password", data)

    return response.data
}
