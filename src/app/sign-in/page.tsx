// src/app/sign-in/page.tsx
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import SigninWithPassword from "@/components/Auth/SigninWithPassword";
import { signUserJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * NOTE: We return a literal `ok: true` type to satisfy the component's Props:
 * (formData) => Promise<{ ok: true; user: { id: number; email: string; name?: string|null }; loginAt: string }>
 */
type LoginResult = {
  ok: true;
  user: { id: number; email: string; name?: string | null };
  loginAt: string;
};

export default function SigninPage() {
  async function loginUser(formData: FormData): Promise<LoginResult> {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const remember =
      String(formData.get("remember") || "") === "true" ||
      String(formData.get("remember") || "") === "on";

    // Find user by email
    const user = await prisma.users.findFirst({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.password) {
      throw new Error("Password not set");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    // Build JWT + cookie
    const loginAt = new Date().toISOString();
    const ttl = remember ? "30d" : "24h";
    const token = await signUserJWT(
      { userId: Number(user.id), email: user.email ?? "", name: user.name ?? null, loginAt },
      ttl
    );

    const jar = await cookies();
    jar.set({
      name: "token",
      value: token,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30d vs 1d
    });

    // Explicit literal return to keep `ok` = true (not boolean)
    return {
      ok: true as const,
      user: {
        id: Number(user.id),
        email: user.email ?? "",
        name: user.name ?? null,
      },
      loginAt,
    };
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-gray-50 px-4 py-10 dark:bg-[#020d1a]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/20 blur-3xl" />
      </div>

      <SigninWithPassword loginUser={loginUser} />
    </main>
  );
}
