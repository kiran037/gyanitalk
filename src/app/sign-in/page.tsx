
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import SigninWithPassword from "@/components/Auth/SigninWithPassword";
const prisma = require("../../prismaClient"); 

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export default function SigninPage() {
  async function loginUser(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = await new SignJWT({ userId: Number(user.id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    return {
      token,
      user: { id: Number(user.id), email: user.email },
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
