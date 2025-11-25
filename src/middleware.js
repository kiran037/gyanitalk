// // /src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ✅ Public route prefixes that support dynamic segments
const PUBLIC_ROUTE_PREFIXES = [
  "/landing/about-us",
  "/landing/terms-of-service",
  "/landing/privacy-policy",
  "/landing/contact",
  "/landing/blog", 
  "/landing/astro",
  "/landing/mall",
  "/landing/courses",
];

const PUBLIC_EXACT_ROUTES = [
  "/",
  "/sign-in",
];

const PROTECTED_ROUTES = ["/dashboard", "/profile"]; 
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function isStaticAsset(pathname) {
  return !!pathname.match(/\.[a-zA-Z0-9]+$/);
}

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ Allow API routes
  if (pathname.startsWith("/api/landing") || 
      pathname.startsWith("/api/public")) {

    return NextResponse.next();
  }

  // ✅ Allow static assets
  if (isStaticAsset(pathname)) {
 
    return NextResponse.next();
  }

  // ✅ Check if it's a public route (exact match or starts with prefix)
  const isPublicRoute = 
    PUBLIC_EXACT_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));



  // ✅ If it's a public route, always allow
  if (isPublicRoute) {

    return NextResponse.next();
  }

  const isProtectedRoute =
    PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)) ||
    (!isPublicRoute && pathname !== "/" && pathname !== "/sign-in");

  if (token) {
    try {
      await jwtVerify(token, secret);

      // Redirect authenticated users away from login pages
      if (pathname === "/sign-in" || pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    } catch {
      // Invalid token - redirect to home and clear cookie
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  // No token - redirect to home if trying to access protected route
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// ✅ Configure matcher to avoid checking static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};