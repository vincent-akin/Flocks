import { NextResponse } from 'next/server';

/**
 * Fast, edge-level gate: redirects to /login if neither auth cookie is
 * present at all. This is a UX optimization only (skip rendering a
 * protected page just to redirect) - it cannot validate the token
 * (that requires the JWT secret, which stays server-side), so an
 * expired-but-present cookie still reaches the page. AuthGuard
 * (src/components/layout/AuthGuard.jsx) is the real client-side check:
 * it calls GET /auth/me and redirects if that fails, which is what
 * actually enforces "you must have a valid session" - the backend
 * remains the ultimate authority regardless of what either of these do.
 */
export function middleware(request) {
  const hasAccessToken = request.cookies.has('accessToken');
  const hasRefreshToken = request.cookies.has('refreshToken');

  if (!hasAccessToken && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
