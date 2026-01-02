import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function GET() {
  try {
    const categories = await prisma.astrologer_categories.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        displayOrder: 'asc', // Respect the CMS ordering
      },
    });

    // Serialize BigInt to String
    const formattedCategories = categories.map((cat) => ({
      id: cat.id.toString(),
      name: cat.name,
      image: cat.image,
    }));

    return NextResponse.json({ success: true, data: formattedCategories });
  } catch (error) {
    console.error("Error fetching astrologer categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}