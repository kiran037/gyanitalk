// src/lib/auth.ts
import { jwtVerify, SignJWT, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function signUserJWT(payload: JWTPayload, ttl: string) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export type SessionClaims = {
  userId: number;
  email?: string;
  name?: string | null;
  loginAt?: string;
} & JWTPayload;

export async function verifyUserJWT(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, secret);
  // normalize types
  const userId = Number(payload.userId);
  if (!Number.isFinite(userId)) throw new Error("Invalid userId in token");
  return { ...(payload as SessionClaims), userId };
}
