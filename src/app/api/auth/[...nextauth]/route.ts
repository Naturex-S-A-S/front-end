import NextAuth from "next-auth";
import { decodeJwt } from "jose";
import CredentialsProvider from "next-auth/providers/credentials";

import { authentication } from "@/api/user";

const handler = NextAuth({
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
                        id: payload.id,
                        name: payload?.name || 'Sin nombre',
                        email: payload?.email || 'Sin correo',
                    };

                    token.permissions = [
                        {
                            "name": "Inventario",
                            "path": null,
                            "children": [
                                {
                                    "name": "Materia prima",
                                    "path": null,
                                    "children": [
                                        {
                                            "name": "Listado de Inventario",
                                            "path": "/inventario/listado",
                                            "actions": {
                                                "view": true
                                            }
                                        },
                                        {
                                            "name": "Control de Salidas",
                                            "path": "/inventory/output-control",
                                            "actions": {
                                                "view": true,
                                                "update": true
                                            }
                                        },
                                        {
                                            "name": "Control de Entradas",
                                            "path": "/inventory/input-control",
                                            "actions": {
                                                "view": true,
                                                "update": true
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "Produccion",
                            "path": null,
                            "children": [
                                {
                                    "name": "Listado de Inventario",
                                    "path": "/inventario/listado",
                                    "actions": {
                                        "view": true,
                                        "delete": true
                                    }
                                }
                            ]
                        },
                        {
                            "name": "Alertas",
                            "path": "/alerts",
                            "children": null
                        }
                    ];

                    token.role = payload.role ?? '';
                } catch (e) {
                    console.error("Failed to decode access_token", e);
                }
            }

            return token;
        },

        async session({ session, token }) {
            // Send properties to the client

            session.access_token = token.access_token;
            session.user = token.user;
            session.permissions = token.permissions;
            session.role = token.role;

            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: "jwt",
    },
});

export { handler as GET, handler as POST };
