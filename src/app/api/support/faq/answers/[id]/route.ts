// // app/api/support/faq/answers/[id]/route.ts
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
    throw new Error(`Invalid answer id: "${id}"`);
  }
}

async function getAnswerId(context: RouteContext): Promise<bigint> {
  const { params } = context;      // params is a Promise
  const { id } = await params;     // unwrap it
  return safeToBigInt(id);
}

// GET single answer by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const id = await getAnswerId(context);

    const answer = await prisma.help_support_quation_answers.findUnique({
      where: { id },
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

    if (!answer || answer.isDelete) {
      return NextResponse.json(
        { success: false, error: "Answer not found" },
        { status: 404 }
      );
    }

    const serializedAnswer = {
      ...answer,
      id: answer.id.toString(),
      helpSupportId: answer.helpSupportId.toString(),
      helpSupportQuationId: answer.helpSupportQuationId.toString(),
      question: answer.question
        ? {
            ...answer.question,
            id: answer.question.id.toString(),
          }
        : null,
    };

    return NextResponse.json({ success: true, data: serializedAnswer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update answer
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const id = await getAnswerId(context);
    const body = await req.json();

    const existingAnswer = await prisma.help_support_quation_answers.findUnique({
      where: { id },
    });

    if (!existingAnswer || existingAnswer.isDelete) {
      return NextResponse.json(
        { success: false, error: "Answer not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isChatWithus !== undefined) updateData.isChatWithus = body.isChatWithus;

    const answer = await prisma.help_support_quation_answers.update({
      where: { id },
      data: updateData,
      include: {
        question: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    });

    const serializedAnswer = {
      ...answer,
      id: answer.id.toString(),
      helpSupportId: answer.helpSupportId.toString(),
      helpSupportQuationId: answer.helpSupportQuationId.toString(),
      question: answer.question
        ? {
            ...answer.question,
            id: answer.question.id.toString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedAnswer,
      message: "Answer updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE answer (soft delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const id = await getAnswerId(context);

    const existingAnswer = await prisma.help_support_quation_answers.findUnique({
      where: { id },
    });

    if (!existingAnswer || existingAnswer.isDelete) {
      return NextResponse.json(
        { success: false, error: "Answer not found" },
        { status: 404 }
      );
    }

    await prisma.help_support_quation_answers.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
