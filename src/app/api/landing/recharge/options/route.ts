///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/recharge/options/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const options = await prisma.rechargeamount.findMany({
    orderBy: { amount: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: options,
  });
}