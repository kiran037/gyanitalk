// app/api/landing/horoscope/sign/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const signs = await prisma.hororscope_signs.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        image: true,
        displayOrder: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
return NextResponse.json({
  success: true,
  data: signs.map((sign) => ({
    id: Number(sign.id), // ✅ FIX BigInt → number
    name: sign.name.toLowerCase(),
    label: sign.name,
    image: sign.image,
  })),
});
  } catch (error) {
    console.error("Error fetching horoscope signs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch horoscope signs",
      },
      { status: 500 }
    );
  }
}