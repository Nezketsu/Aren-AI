import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  // If user is not authenticated and not on login, redirect to login
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated or on login, continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/account'],
};
