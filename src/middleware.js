import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/auth/signin", "/auth/register"];
const PROTECTED_ROUTES = ["/", "/profile"];

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage = PUBLIC_ROUTES.includes(req.nextUrl.pathname);
  const isProtectedPage = PROTECTED_ROUTES.includes(req.nextUrl.pathname);

  if (token) {
    try {
      await jwtVerify(token, secret);

      if (isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/sign-in", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  if (isProtectedPage) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/", "/profile", "/sign-in", "/auth/register"],
};
