import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req: NextRequest) {
        // Debugging info
        console.log("Middleware hit:", req.nextUrl.pathname);

        return NextResponse.next();
    },
    {
        callbacks: {
            // Use only the expected params for authorized (token). Avoid using req here.
            authorized: ({ token }) => {
                try {
                    console.log("Middleware authorized callback. Token existe:", !!token);

                    return !!token;
                } catch (err) {
                    console.error("Middleware authorized error:", err);

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
        '/((?!login$|api/auth|_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
