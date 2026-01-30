import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/nextAuthOptions'


export async function ApiServer<T>(path: string, tags?: string[]): Promise<T> {
    const session = await getServerSession(authOptions)

    const headers: HeadersInit = {}

    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`

    // timeout guard
    const controller = new AbortController()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
        headers,
        cache: 'no-store',
        signal: controller.signal,
        next: {
            tags
        }
    })


    return res.json() as Promise<T>
}
