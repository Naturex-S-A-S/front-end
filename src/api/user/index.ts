import { API } from "../instances"
import type { IAuthenticationData } from "./types"

export const authentication = async (data: IAuthenticationData) => {
    const response = await API().post("/auth/login", data)

    return response.data
}

export const getProfile = async () => {
    const response = await API().get("/profile/me")

    return response.data

    /* return {
        "id": "1648491169dd97ad0891ff1cf9c7facb946515213e91504537b793361dcbd38d",
        "dniType": "cedula",
        "dni": "126",
        "name": "user 001",
        "lastName": "Carvajal",
        "email": "user@camilo.com",
        "address": "Urbanizacion Rosales de terranova. Bello, Antioquia.",
        "phone": "+57 314 517 0000",
        "password": "$2a$10$CDxti8isQAOQ43BEzzU.bu6QD6Sypt7GkG2yPNhIdFs5gF9oC.o4y",
        "role": "role for users",
        "modules": [
            {
                "moduleId": 12,
                "moduleName": "Soporte",
                "submoduleName": "Usuarios y roles",
                "groupName": null,
                "modulePath": "/soporte/usuarios-y-roles",
                "read": true,
                "write": false,
                "update": true,
                "delete": false
            }
        ]
    }*/
}

export const getUserById = async () => {
    const response = await API().get("/users/45256c3e9e4c1eb3af30412aa51b4af3d93ef90a7bfe47c12352ccee355c74df")

    return response.data
}
