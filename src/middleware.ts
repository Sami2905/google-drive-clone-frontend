import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED = [
  '/dashboard',
  '/settings',
  '/trash',
  '/shared',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the token to downstream requests (e.g., API routes) as header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('Authorization', `Bearer ${token}`);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings', '/trash', '/shared'],
};
