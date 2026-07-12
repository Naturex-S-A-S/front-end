import { decodeJwt } from "jose";
import CredentialsProvider from "next-auth/providers/credentials";

import { authentication } from "@/api/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const authOptions = {
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
    async jwt({ token, user }: any) {
      if (user) {
        // Login: user info viene del body, exp y modules del JWT
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

      // Refresh si el token está expirado
      if (token.tokenExpires && Date.now() / 1000 > token.tokenExpires) {
        try {
          const res = await fetch(`${API_BASE_URL}auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refresh_token })
          });

          if (!res.ok) {
            console.error("Token refresh failed:", res.status, await res.text().catch(() => ""));

            return null;
          }

          const data = await res.json();

          console.log("Token refreshed successfully:", data);

          if (data.token) {
            const payload: any = decodeJwt(data.token);

            token.access_token = data.token;
            token.tokenExpires = payload.exp;

            // Solo actualizar refreshToken si la API devuelve uno nuevo
            if (data.refreshToken) {
              token.refresh_token = data.refreshToken;
            }
          }
        } catch (e) {
          console.error("Token refresh error:", e);

          return null;
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.user = token.user;
      session.permissions = token.permissions;
      session.role = token.role;
      session.tokenExpires = token.tokenExpires;

      return session;
    }
  },

  pages: {
    signIn: "/login"
  }
};
