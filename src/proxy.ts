// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// This function can be marked `async` if using `await` inside
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /dashboard and its subpaths
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("token")?.value;

    //console.log("cookies:", req.cookies.getAll());

    if (!token) {
      // Redirect to login if token is missing
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verify JWT token
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Continue normally if token is valid or route is public
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/dashboard/:path*"],
};