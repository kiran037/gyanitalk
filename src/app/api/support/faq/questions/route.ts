// // app/api/support/faq/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all FAQ questions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    let page = parseInt(searchParams.get("page") || "1", 10);
    let limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) limit = 50;

    const skip = (page - 1) * limit;

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
      try {
        where.helpSupportId = BigInt(categoryId);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid categoryId" },
          { status: 400 }
        );
      }
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const total = await prisma.help_support_quations.count({ where });

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

    const serializedQuestions = questions.map((q) => ({
      ...q,
      id: q.id.toString(),
      helpSupportId: q.helpSupportId.toString(),
      support: q.support
        ? {
            ...q.support,
            id: q.support.id.toString(),
          }
        : null,
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
    const {
      helpSupportId,
      question,
      answer,
      isActive,
      isChatWithus,
      createdBy,
    } = body;

    if (!helpSupportId || !question) {
      return NextResponse.json(
        { success: false, error: "Category ID and question are required" },
        { status: 400 }
      );
    }

    let helpSupportBig: bigint;
    try {
      helpSupportBig = BigInt(helpSupportId);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid helpSupportId" },
        { status: 400 }
      );
    }

    const category = await prisma.help_supports.findUnique({
      where: { id: helpSupportBig },
    });

    if (!category || category.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const newQuestion = await prisma.help_support_quations.create({
      data: {
        helpSupportId: helpSupportBig,
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

    const serializedQuestion = {
      ...newQuestion,
      id: newQuestion.id.toString(),
      helpSupportId: newQuestion.helpSupportId.toString(),
      support: newQuestion.support
        ? {
            ...newQuestion.support,
            id: newQuestion.support.id.toString(),
          }
        : null,
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
