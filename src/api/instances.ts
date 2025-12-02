import axios from "axios"
import { getSession } from "next-auth/react"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
})

api.interceptors.request.use(async (config) => {
    const session = await getSession()

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
})

export const API = () => api
