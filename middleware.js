// middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Check for a session or token using next-auth
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If accessing /errorCode and not authenticated, redirect to login
  if (req.nextUrl.pathname.startsWith('/errorCode') && !session) {
    return NextResponse.redirect('/auth/login');
  }

  // Allow the request to continue if authenticated
  return NextResponse.next();
}
