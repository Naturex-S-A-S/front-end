import NextAuth from "next-auth";
import { decodeJwt } from "jose";
import CredentialsProvider from "next-auth/providers/credentials";

import { authentication } from "@/api/user";

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                document: { label: "Document", type: "text" },
                password: { label: "Password", type: "password" },
                documentType: {
                    label: "Document Type",
                    type: "select"
                },
            },

            async authorize(credentials) {
                if (!credentials?.document || !credentials?.password) {
                    return null;
                }

                const res = await authentication({
                    dni: credentials.document,
                    dniType: credentials.documentType,
                    password: credentials.password
                })

                if (!res.token) {
                    return null;
                }

                return res.token
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.access_token = user;

                try {
                    // Decode JWT
                    const payload: any = decodeJwt(token.access_token as string);

                    console.log("Decoded JWT payload:", payload);

                    // User
                    token.user = {
                        id: payload.userId,
                        name: payload?.userName || 'Sin nombre',
                        email: payload?.email || '',
                    };

                    token.permissions = payload.modules

                    token.role = payload.role ?? '';

                    token.tokenExpires = payload.exp
                } catch (e) {
                    console.error("Failed to decode access_token", e);
                }
            }

            return token;
        },

        async session({ session, token }: any) {
            // Send properties to the client

            session.access_token = token.access_token;
            session.user = token.user;
            session.permissions = token.permissions;
            session.role = token.role;
            session.tokenExpires = token.tokenExpires;

            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    /*session: {
        strategy: "jwt",
    },*/
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
