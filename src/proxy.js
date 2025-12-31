
// src/proxy.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTE_PREFIXES = [
  "/about-us",
  "/terms-of-service",
  "/privacy-policy",
  "/contact",
  "/blog",
  "/talk-to-astrologers",
  "/mall",
  "/courses",
  "/horoscope",
  "/panchang",
  "/free-kundali",
  "/kundali-matching"
];

const PUBLIC_EXACT_ROUTES = [
  "/",
  "/sign-in",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-static.xml",
  "/sitemap-blogs.xml",
  "/sitemap-courses.xml",
  "/sitemap-products.xml",
  "/sitemap-astrologers.xml",
  "/sitemap-horoscope.xml",
];

// Define actual protected routes that require authentication
const PROTECTED_ROUTE_PREFIXES = [
  "/admin",
  "/profile",
  "/dashboard"
];

function getSecret() {
  if (!process.env.JWT_SECRET) {
    console.warn("[proxy] JWT_SECRET not set in environment");
    return null;
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

function isStaticAsset(pathname) {
  return !!pathname.match(/\.[a-zA-Z0-9]+$/);
}

// NOTE: export name must be `proxy` (or default export) — Next.js will call this for each request.
export async function proxy(req) {
  const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;

  if (pathname === "/robots.txt" || pathname.startsWith("/sitemap")) {
    return NextResponse.next();
  }
  
  // Allow open API endpoints
  if (
    pathname.startsWith("/api/landing") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/indexnow")
  ) {
    return NextResponse.next();
  }

  // Allow static assets (matcher already excludes many, but this is safe)
  if (isStaticAsset(pathname)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  const isPublicRoute =
    PUBLIC_EXACT_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Check if this is actually a protected route (not just "not public")
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) => 
    pathname.startsWith(prefix)
  );

  // If user has token, verify and handle redirects
  if (token) {
    const secret = getSecret();
    if (!secret) {
      const resp = NextResponse.redirect(new URL("/", req.url));
      resp.cookies.set("token", "", { path: "/", maxAge: 0 });
      return resp;
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload?.role || payload?.roles || payload?.roleName || null;

      // If logged in user hits landing/signin, redirect to dashboard
      const isAuthLandingHit = pathname === "/sign-in" || pathname === "/";
      if (isAuthLandingHit) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      // If admin hits public routes, redirect to dashboard
      if (role === "admin" && isPublicRoute) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      return NextResponse.next();
    } catch (err) {
      // Invalid token - clear it and redirect to home
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("token", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  // No token - check if trying to access protected routes
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // For all other routes (public or non-existent), let Next.js handle them
  // This allows 404 pages to work properly
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};