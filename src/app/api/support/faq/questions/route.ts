// app/api/support/faq/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all FAQ questions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDelete: false,
    };

    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
      ];
    }

    if (categoryId) {
      where.helpSupportId = BigInt(categoryId);
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Get total count
    const total = await prisma.help_support_quations.count({ where });

    // Get questions with category and answers
    const questions = await prisma.help_support_quations.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        support: {
          select: {
            id: true,
            name: true,
          },
        },
        help_support_quation_answers: {
          where: { isDelete: false },
          orderBy: { created_at: "desc" },
        },
      },
    });

    // Serialize BigInt
    const serializedQuestions = questions.map((q) => ({
      ...q,
      id: q.id.toString(),
      helpSupportId: q.helpSupportId.toString(),
      support: q.support ? {
        ...q.support,
        id: q.support.id.toString(),
      } : null,
      help_support_quation_answers: q.help_support_quation_answers.map((a) => ({
        ...a,
        id: a.id.toString(),
        helpSupportId: a.helpSupportId.toString(),
        helpSupportQuationId: a.helpSupportQuationId.toString(),
      })),
      answerCount: q.help_support_quation_answers.length,
    }));

    return NextResponse.json({
      success: true,
      data: serializedQuestions,
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

// POST create new question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { helpSupportId, question, answer, isActive, isChatWithus, createdBy } = body;

    // Validation
    if (!helpSupportId || !question) {
      return NextResponse.json(
        { success: false, error: "Category ID and question are required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.help_supports.findUnique({
      where: { id: BigInt(helpSupportId) },
    });

    if (!category || category.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const newQuestion = await prisma.help_support_quations.create({
      data: {
        helpSupportId: BigInt(helpSupportId),
        question,
        answer: answer || null,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        isChatWithus: isChatWithus || 0,
        createdBy: createdBy || 1,
        modifiedBy: createdBy || 1,
      },
      include: {
        support: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Serialize BigInt
    const serializedQuestion = {
      ...newQuestion,
      id: newQuestion.id.toString(),
      helpSupportId: newQuestion.helpSupportId.toString(),
      support: newQuestion.support ? {
        ...newQuestion.support,
        id: newQuestion.support.id.toString(),
      } : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: serializedQuestion,
        message: "Question created successfully",
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