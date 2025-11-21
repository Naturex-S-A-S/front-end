import axios from "axios"

//import { getSession } from "next-auth/react"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

/* api.interceptors.request.use(
    async (config) => {
        try {
            const session: any = await getSession()

            if (session?.token) {
                config.headers = config.headers ?? {}
                    ; (config.headers as Record<string, string>)["Authorization"] = `Bearer ${session.token}`
            }
        } catch (err) {
            console.error("API interceptor getSession error:", err)
        }


        return config
    },
    (error) => Promise.reject(error)
) */

export const API = () => api
