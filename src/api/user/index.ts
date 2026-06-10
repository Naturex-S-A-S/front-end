import { API } from "../instances"
import type { IAuthenticationData } from "./types"
import type { IUser } from "@/types/pages/user"

export const authentication = async (data: IAuthenticationData) => {
    const response = await API().post("/auth/login", data)

    return response.data
}

export const postUser = async (data: IUser) => {
    const response = await API().post("/users", data)

    return response.data
}

export const getUsers = async () => {
    const response = await API().get("/users")

    return response.data
}

export const putUser = async (data: IUser) => {
    const response = await API().put(`/users/${data.id}`, data)

    return response.data
}

export const deleteUser = async (id: string) => {
    const response = await API().delete(`/users/${id}`)

    return response.data
}
