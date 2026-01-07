// src/proxy.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// PUBLIC ROUTES - No authentication needed
const PUBLIC_EXACT_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-static.xml",
  "/sitemap-blogs.xml",
  "/sitemap-courses.xml",
  "/sitemap-products.xml",
  "/sitemap-astrologers.xml",
  "/sitemap-horoscope.xml",
];

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
  "/kundali-matching",
  "/verify-email",
];

// PROTECTED ROUTES - Require login (any role)
const PROTECTED_ROUTE_PREFIXES = [
  "/profile",
  "/dashboard",
  "/security",
  "/sessions",
];

// ADMIN ROUTES - Require login + admin/staff role (NOT user/astrologer)
const ADMIN_ROUTE_PREFIXES = ["/admin"];

// USER/ASTROLOGER ROLE IDS (Cannot access admin routes)
const USER_ROLE_ID = "3";
const ASTROLOGER_ROLE_ID = "2";

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

// Check if user has admin/staff role (NOT user or astrologer)
async function hasAdminAccess(userId) {
  try {
   const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/me`, {
      headers: {
        Cookie: `token=${arguments[1]}`, // Pass token
      },
    });

    if (!res.ok) return false;

    const { data } = await res.json();
    const roleIds = data.roles.map((r) => r.id);

    // Admin access = NOT user (3) AND NOT astrologer (2)
    return !roleIds.includes(USER_ROLE_ID) && !roleIds.includes(ASTROLOGER_ROLE_ID);
  } catch (error) {
    console.error("[proxy] Error checking admin access:", error);
    return false;
  }
}

export async function proxy(req) {
  const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;

  // Allow sitemaps and robots
  if (pathname === "/robots.txt" || pathname.startsWith("/sitemap")) {
    return NextResponse.next();
  }

  // Allow open API endpoints
  if (
    pathname.startsWith("/api/landing") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/indexnow") ||
    pathname.startsWith("/api/auth") || // Auth endpoints are public
    pathname.startsWith("/api/upload") // Upload endpoint
  ) {
    return NextResponse.next();
  }

  // Allow static assets
  if (isStaticAsset(pathname)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  // Determine route type
  const isPublicRoute =
    PUBLIC_EXACT_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAdminRoute = ADMIN_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // ===== LOGGED IN USER =====
  if (token) {
    const secret = getSecret();
    if (!secret) {
      const resp = NextResponse.redirect(new URL("/", req.url));
      resp.cookies.set("token", "", { path: "/", maxAge: 0 });
      return resp;
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId;

      // Redirect logged-in users from auth pages
      if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
        // Check if admin
        const isAdmin = await hasAdminAccess(userId, token);
        return NextResponse.redirect(
          new URL(isAdmin ? "/admin/dashboard" : "/", req.url)
        );
      }

      // ADMIN ROUTE ACCESS CHECK
      if (isAdminRoute) {
        const isAdmin = await hasAdminAccess(userId, token);
        if (!isAdmin) {
          // User or Astrologer trying to access admin route
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      // Allow access to protected and public routes
      return NextResponse.next();
    } catch (err) {
      // Invalid token - clear and redirect
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("token", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  // ===== NOT LOGGED IN =====

  // Block admin routes
  if (isAdminRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Block protected routes
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For unknown routes, let Next.js handle (404 page)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};