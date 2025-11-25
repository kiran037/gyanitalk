import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete the token cookie
    cookieStore.delete("token");
    
    // Also try to delete any variants
    ["auth_token", "jwt", "session", "accessToken"].forEach((name) => {
      try {
        cookieStore.delete(name);
      } catch {}
    });

    const res = NextResponse.json({ 
      ok: true, 
      message: "Logged out successfully",
      cleared: true  // ✅ Add this flag
    });

    // IMPORTANT: Set the main token cookie to expired with ALL the same options
    res.cookies.set({
      name: "token",
      value: "",
      maxAge: 0,  // Expire immediately
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Logout failed",
      cleared: false 
    }, { status: 500 });
  }
}