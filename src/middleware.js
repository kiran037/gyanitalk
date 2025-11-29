// /src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

  // Allow API routes and public API endpoints
  if (pathname.startsWith("/api/landing") ||
      pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  // Allow static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Determine if request is public route (exact match or starts with prefix)
  const isPublicRoute =
    PUBLIC_EXACT_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));

  // If there's a token, validate it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      // Read role from payload. Adjust the claim name if your JWT uses a different key.
      const role = payload?.role || payload?.roles || payload?.roleName || null;

      const isAuthLandingHit = pathname === "/sign-in" || pathname === "/";

      if (isAuthLandingHit) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }


      if (role === "admin" && isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // For all other valid tokens, let the request pass
      return NextResponse.next();
    } catch (err) {
      // Invalid token — clear cookie and redirect to home
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  // No token: if trying to access protected route, redirect to home
  const isProtectedRoute =
    PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)) ||
    (!isPublicRoute && pathname !== "/" && pathname !== "/sign-in");

  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Otherwise allow public routes for unauthenticated visitors
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
