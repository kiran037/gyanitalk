// /src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/landing", "/sign-in", "/landing/about","/landing/termsofservice","/landing/privacypolicy","/landing/contact","/landing/blog"];
const PROTECTED_ROUTES = ["/", "/profile"]; // keep if you want explicit protected pages

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function isStaticAsset(pathname) {
  // allow requests that look like files: /something/file.png, /foo/bar.svg, /fonts/abc.woff2
  return !!pathname.match(/\.[a-zA-Z0-9]+$/);
}

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ Allow only /api/landing/* routes to be public (no auth required)
  if (pathname.startsWith("/api/landing")) {
    return NextResponse.next();
  }

  // treat any subpath of public routes as public (e.g. /landing and /landing/*)
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  // allow static assets to pass through (images, css, fonts) — important for public/ assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const isProtectedRoute =
    PROTECTED_ROUTES.includes(pathname) ||
    (!isPublicRoute && pathname !== "/landing" && pathname !== "/sign-in");

  if (token) {
    try {
      await jwtVerify(token, secret);

      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/landing", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  if (isProtectedRoute) {
    return NextResponse.redirect(new URL("/landing", req.url));
  }

  return NextResponse.next();
}