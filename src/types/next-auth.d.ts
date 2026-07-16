import "next-auth";
import "next-auth/jwt";

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

declare module "next-auth" {
  interface Session {
    error?: string;
    access_token?: string;
    refresh_token?: string;
    tokenExpires?: number;
    permissions?: IPermissions[];
    user?: {
      id?: string;
      name?: string;
      email?: string;
    };
    role?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    error?: string;
    access_token?: string;
    refresh_token?: string;
    tokenExpires: number;
    user?: {
      id?: string;
      name?: string;
      email?: string;
    };
    role: any;
    permissions?: IPermissions[];
  }
}
