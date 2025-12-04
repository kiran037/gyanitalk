// app/api/support/faq/answers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single answer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

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

    // Serialize BigInt
    const serializedAnswer = {
      ...answer,
      id: answer.id.toString(),
      helpSupportId: answer.helpSupportId.toString(),
      helpSupportQuationId: answer.helpSupportQuationId.toString(),
      question: answer.question ? {
        ...answer.question,
        id: answer.question.id.toString(),
      } : null,
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
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    // Check if answer exists
    const existingAnswer = await prisma.help_support_quation_answers.findUnique({
      where: { id },
    });

    if (!existingAnswer || existingAnswer.isDelete) {
      return NextResponse.json(
        { success: false, error: "Answer not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isChatWithus !== undefined) updateData.isChatWithus = body.isChatWithus;

    // Update answer
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

    // Serialize BigInt
    const serializedAnswer = {
      ...answer,
      id: answer.id.toString(),
      helpSupportId: answer.helpSupportId.toString(),
      helpSupportQuationId: answer.helpSupportQuationId.toString(),
      question: answer.question ? {
        ...answer.question,
        id: answer.question.id.toString(),
      } : null,
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    // Check if answer exists
    const existingAnswer = await prisma.help_support_quation_answers.findUnique({
      where: { id },
    });

    if (!existingAnswer || existingAnswer.isDelete) {
      return NextResponse.json(
        { success: false, error: "Answer not found" },
        { status: 404 }
      );
    }

    // Soft delete
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