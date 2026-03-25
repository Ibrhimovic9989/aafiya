import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use Edge-safe auth config (no Prisma/pg imports)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth-related, static, and cron/notification routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/notifications') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw-push.js' ||
    pathname.startsWith('/icons')
  ) {
    return;
  }

  // Require auth for everything else
  if (!req.auth) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
};
