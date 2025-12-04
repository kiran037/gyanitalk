// // app/api/support/faq/questions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

function safeToBigInt(id: string): bigint {
  try {
    return BigInt(id);
  } catch {
    throw new Error(`Invalid question id: "${id}"`);
  }
}

async function getQuestionId(context: RouteContext): Promise<bigint> {
  const { params } = context;   // params is a Promise
  const { id } = await params;  // unwrap
  return safeToBigInt(id);
}

// GET single question by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const id = await getQuestionId(context);

    const question = await prisma.help_support_quations.findUnique({
      where: { id },
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

    if (!question || question.isDelete) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const serializedQuestion = {
      ...question,
      id: question.id.toString(),
      helpSupportId: question.helpSupportId.toString(),
      support: question.support
        ? {
            ...question.support,
            id: question.support.id.toString(),
          }
        : null,
      help_support_quation_answers: question.help_support_quation_answers.map(
        (a) => ({
          ...a,
          id: a.id.toString(),
          helpSupportId: a.helpSupportId.toString(),
          helpSupportQuationId: a.helpSupportQuationId.toString(),
        })
      ),
    };

    return NextResponse.json({ success: true, data: serializedQuestion });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update question
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const id = await getQuestionId(context);
    const body = await req.json();

    const existingQuestion = await prisma.help_support_quations.findUnique({
      where: { id },
    });

    if (!existingQuestion || existingQuestion.isDelete) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.question !== undefined) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isChatWithus !== undefined)
      updateData.isChatWithus = body.isChatWithus;
    if (body.helpSupportId !== undefined) {
      try {
        updateData.helpSupportId = BigInt(body.helpSupportId);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid helpSupportId" },
          { status: 400 }
        );
      }
    }

    const question = await prisma.help_support_quations.update({
      where: { id },
      data: updateData,
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
      ...question,
      id: question.id.toString(),
      helpSupportId: question.helpSupportId.toString(),
      support: question.support
        ? {
            ...question.support,
            id: question.support.id.toString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedQuestion,
      message: "Question updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE question (soft delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const id = await getQuestionId(context);

    const existingQuestion = await prisma.help_support_quations.findUnique({
      where: { id },
      include: {
        help_support_quation_answers: {
          where: { isDelete: false },
        },
      },
    });

    if (!existingQuestion || existingQuestion.isDelete) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    await prisma.help_support_quations.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    if (existingQuestion.help_support_quation_answers.length > 0) {
      await prisma.help_support_quation_answers.updateMany({
        where: {
          helpSupportQuationId: id,
          isDelete: false,
        },
        data: {
          isDelete: true,
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Question and related answers deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
