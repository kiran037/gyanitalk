
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import SigninWithPasswordClient from "@/components/Auth/SigninWithPassword";
const prisma = require("../../prismaClient");

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default function SigninWithPassword() {
  async function loginUser(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = await new SignJWT({ userId: Number(user.id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    return {
      token,
      user: {
        id: Number(user.id),
        email: user.email
      }
    };

  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="p-6 sm:p-8 md:p-10">
            <SigninWithPasswordClient loginUser={loginUser} />
          </div>
        </div>
      </div>
    </>
  );
  return <SigninWithPasswordClient loginUser={loginUser} />;
}
