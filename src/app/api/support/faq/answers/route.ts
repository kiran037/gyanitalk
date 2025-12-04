// app/api/support/faq/answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all answers (optionally filtered by question)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const questionId = searchParams.get("questionId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDelete: false,
    };

    if (questionId) {
      where.helpSupportQuationId = BigInt(questionId);
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Get total count
    const total = await prisma.help_support_quation_answers.count({ where });

    // Get answers with question details
    const answers = await prisma.help_support_quation_answers.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
      },
    });

    // Serialize BigInt
    const serializedAnswers = answers.map((a) => ({
      ...a,
      id: a.id.toString(),
      helpSupportId: a.helpSupportId.toString(),
      helpSupportQuationId: a.helpSupportQuationId.toString(),
      question: a.question ? {
        ...a.question,
        id: a.question.id.toString(),
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedAnswers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new answer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      helpSupportId,
      helpSupportQuationId,
      title,
      description,
      isActive,
      isChatWithus,
      createdBy,
    } = body;

    // Validation
    if (!helpSupportId || !helpSupportQuationId) {
      return NextResponse.json(
        { success: false, error: "Category ID and Question ID are required" },
        { status: 400 }
      );
    }

    // Check if question exists
    const question = await prisma.help_support_quations.findUnique({
      where: { id: BigInt(helpSupportQuationId) },
    });

    if (!question || question.isDelete) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const newAnswer = await prisma.help_support_quation_answers.create({
      data: {
        helpSupportId: BigInt(helpSupportId),
        helpSupportQuationId: BigInt(helpSupportQuationId),
        title: title || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        isChatWithus: isChatWithus || 0,
        createdBy: createdBy || 1,
        modifiedBy: createdBy || 1,
      },
      include: {
        question: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    });

    // Serialize BigInt
    const serializedAnswer = {
      ...newAnswer,
      id: newAnswer.id.toString(),
      helpSupportId: newAnswer.helpSupportId.toString(),
      helpSupportQuationId: newAnswer.helpSupportQuationId.toString(),
      question: newAnswer.question ? {
        ...newAnswer.question,
        id: newAnswer.question.id.toString(),
      } : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: serializedAnswer,
        message: "Answer created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}