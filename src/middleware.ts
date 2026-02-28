import { NextResponse } from "next/server";

import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            // Use only the expected params for authorized (token). Avoid using req here.
            authorized: ({ token }) => {
                try {
                    if (!token?.tokenExpires) return false

                    const currentTime = Math.floor(Date.now() / 1000);

                    if (token.tokenExpires < currentTime) {
                        return false;
                    }

                    return !!token;
                } catch (err) {
                    return false;
                }
            },
        },
    }
);

// Limit where middleware runs; avoid applying to next-auth endpoints
export const config = {
    matcher: [
        // Ejecuta en todas las rutas excepto:
        // - /login
        // - rutas de next internals y recursos
        // - el endpoint de next-auth (si usas /api/auth)
        // - recursos estáticos en /images (para que se sirvan los avif/png/jpg)
        '/((?!login$|test$|api/auth|_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
