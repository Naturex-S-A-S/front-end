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
          id: res.userId,
          access_token: res.token,
          refresh_token: res.refreshToken,
          userId: res.userId,
          userName: res.userName,
          userLastName: res.userLastName,
          email: res.email,
          role: res.role,
          modules: res.modules
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
          id: user.userId,
          name: `${user.userName} ${user.userLastName}`.trim(),
          email: user.email
        };
        token.permissions = user.modules;
        token.role = user.role;
        token.tokenExpires = payload.exp;
      }

      // Refresh si el token está próximo a expirar
      if (token.tokenExpires && Date.now() / 1000 > token.tokenExpires) {
        try {
          const res = await fetch(`${API_BASE_URL}auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refresh_token })
          });

          if (!res.ok) {
            console.error("Token refresh failed:", res.status);

            return null;
          }

          const data = await res.json();
          const payload: any = decodeJwt(data.token);

          token.access_token = data.token;
          token.refresh_token = data.refreshToken;
          token.tokenExpires = payload.exp;
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
