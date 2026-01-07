// src/lib/auth/index.ts
import { jwtVerify, SignJWT, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

export type SessionClaims = {
  userId: number;
  email?: string;
  name?: string | null;
  loginAt?: string;
  sessionId?: string; // Track which session this token belongs to
} & JWTPayload;

/**
 * Sign a new JWT token
 */
export async function signUserJWT(
  payload: JWTPayload,
  ttl: string
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

/**
 * Verify and decode JWT token
 */
export async function verifyUserJWT(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, secret);
  const userId = Number(payload.userId);
  if (!Number.isFinite(userId)) throw new Error("Invalid userId in token");
  return { ...(payload as SessionClaims), userId };
}

/**
 * Get current session from request
 */
export async function getSession(
  request: NextRequest
): Promise<SessionClaims | null> {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    return await verifyUserJWT(token);
  } catch (e) {
    return null;
  }
}

/**
 * Get session from cookies (for server components)
 */
export async function getServerSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return await verifyUserJWT(token);
  } catch (e) {
    return null;
  }
}

/**
 * Set auth cookie
 */
export function setAuthCookie(token: string, remember: boolean = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30d vs 1d

  return {
    name: "token",
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie() {
  return {
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  };
}