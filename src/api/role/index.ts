import { API } from "../instances"

export const postRole = async (data: any) => {
    const response = await API().post("/roles/privileges", data)

    return response.data
}

export const getRoles = async () => {
    const response = await API().get("/roles")

    return response.data
}

export const getRoleById = async (id: number) => {
    const response = await API().get(`/roles/${id}`)

    return response.data
}

export const deleteRole = async (id: string) => {
    const response = await API().delete(`/roles/${id}`)

    return response.data
}

export const getRoleModules = async () => {
    const response = await API().get(`/roles/modules`)

    return response.data.data
}

export const updateRole = async (id: number, data: any) => {
    const response = await API().put(`/roles/${id}/privileges`, data)

    return response.data
}
