// /src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/landing/about",
  "/landing/termsofservice",
  "/landing/privacypolicy",
  "/landing/contact",
  "/landing/blog"
];

const PROTECTED_ROUTES = ["/dashboard", "/profile"]; // Define your actual protected dashboard routes

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function isStaticAsset(pathname) {
  // allow requests that look like files: /something/file.png, /foo/bar.svg, /fonts/abc.woff2
  return !!pathname.match(/\.[a-zA-Z0-9]+$/);
}

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ Allow only /api/landing/* routes to be public (no auth required)
  // You might want to rename this to /api/public/* for clarity
  if (pathname.startsWith("/api/landing") || pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  // treat any subpath of public routes as public (e.g. /blog and /blog/*)
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  // allow static assets to pass through (images, css, fonts) — important for public/ assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const isProtectedRoute =
    PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)) ||
    (!isPublicRoute && pathname !== "/" && pathname !== "/sign-in");

  if (token) {
    try {
      await jwtVerify(token, secret);

      // If user is authenticated and trying to access public auth pages, redirect to dashboard
      if (pathname === "/sign-in" || pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    } catch {
      // Invalid token - clear it and redirect to home
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  // No token - check if trying to access protected route
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}