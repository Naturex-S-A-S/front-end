import { decodeJwt } from "jose";
import CredentialsProvider from "next-auth/providers/credentials";

import type { Account, NextAuthOptions, Profile } from "next-auth";

import type { JWT } from "next-auth/jwt";

import { authentication } from "@/api/user";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        document: { label: "Document", type: "text" },
        password: { label: "Password", type: "password" },
        documentType: {
          label: "Document Type",
          type: "select"
        }
      },

      async authorize(credentials) {
        if (!credentials?.document || !credentials?.password) {
          return null;
        }

        const res = await authentication({
          dni: credentials.document,
          dniType: credentials.documentType,
          password: credentials.password
        });

        if (!res.token) {
          return null;
        }

        return {
          id: "",
          access_token: res.token,
          refresh_token: res.refreshToken

          /*id: res.userId,
          userId: res.userId,
          userName: res.userName,
          userLastName: res.userLastName,
          email: res.email,
          role: res.role,
          modules: res.modules*/
        };
      }
    })
  ],

  callbacks: {
    async jwt({
      token,
      user
    }: {
      token: JWT;
      user: any;
      account: Account | null;
      profile?: Profile | undefined;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }): Promise<JWT> {
      if (user) {
        const payload: any = decodeJwt(user.access_token as string);

        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.user = {
          id: payload.userId,
          name: `${payload.userName} ${payload.userLastName}`.trim(),
          email: payload.email
        };
        token.permissions = payload.modules;
        token.role = payload.role;
        token.tokenExpires = payload.exp;
      }

      // Comentado por si se llega a implementar el refresh token
      /* const now = Math.floor(Date.now() / 1000);
      if (token.tokenExpires && now >= token.tokenExpires) {
        try {
          if (!refreshPromise) {
            const refreshPromise = fetch(`${API_BASE_URL}auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: token.refresh_token })
            }).then(async res => {
              if (!res.ok) {
                throw new Error(`Refresh failed: ${res.status} ${res.statusText}`);
              }

              const data = await res.json();

              if (!data.token) {
                throw new Error("No token in refresh response");
              }

              const payload: any = decodeJwt(data.token);

              return {
                access_token: data.token,
                exp: payload.exp,
                refresh_token: data.refreshToken || token.refresh_token
              };
            });
          }

          const result = await refreshPromise;

          token.access_token = result.access_token;
          token.tokenExpires = result.exp;
          token.refresh_token = result.refresh_token;
        } catch (e) {
          token.error = "RefreshTokenError";
        } finally {
          refreshPromise = null;
        }
      } */

      return token;
    },

    async session({ session, token }: any) {
      session.error = token?.error;
      session.access_token = token?.access_token;
      session.refresh_token = token?.refresh_token;
      session.user = token?.user;
      session.permissions = token?.permissions;
      session.role = token?.role;
      session.tokenExpires = token?.tokenExpires;

      return session;
    }
  },

  debug: false,

  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    }
  },

  events: {
    signIn: message => console.log("User signed in:", message),
    signOut: message => console.log("User signed out:", message),
    session(message) {
      console.log("Session event:", message);
    }
  },

  pages: {
    signIn: "/login"
  }
};
