import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    // 1. Find the 'FAQ' Category
    const faqCategory = await prisma.help_supports.findFirst({
      where: {
        name: { contains: "FAQ" },
        isActive: true,
        isDelete: false,
      },
      include: {
        // 2. Get the Questions (help_support_quations)
        subCategory: {
          where: {
            isActive: true,
            isDelete: false,
          },
          take: 6, // Limit to 6 questions
          include: {
            // 3. Get the Answers (help_support_quation_answers)
            help_support_quation_answers: {
              where: {
                isActive: true,
                isDelete: false,
              },
              select: {
                description: true, // This is the actual answer text
              },
              take: 1, // Take the first answer found
            },
          },
        },
      },
    });

    if (!faqCategory || !faqCategory.subCategory) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 4. Map the data structure for the frontend
    const formattedFaqs = faqCategory.subCategory.map((q) => {
      // Extract answer from the nested array
      const answerText = q.help_support_quation_answers?.[0]?.description || 
                         "Detailed answer not available.";

      return {
        id: q.id.toString(),
        question: q.question,
        answer: answerText,
      };
    });

    return NextResponse.json({ success: true, data: formattedFaqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}