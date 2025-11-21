import 'next-auth'
import 'next-auth/jwt'

export type Actions = "read" | "create" | "update" | "delete" | "manage";

export interface IPermissions {
    name: string;
    path: null | string;
    children: IChild[] | null;
}

export interface IChild {
    name: string;
    path: null | string;
    children?: IChild[];
    actions?: Actions;
}

declare module 'next-auth' {
    interface Session {
        access_token?: string
        user?: {
            id?: string
            name?: string
            email?: string
        }
        role: string
        modules: any
        permissions?: IPermissions[]
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        access_token?: string
        user?: {
            id?: string
            name?: string
            email?: string
        }
        role: string
        permissions?: IPermissions[]
    }
}
