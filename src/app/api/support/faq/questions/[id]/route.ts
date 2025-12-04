// app/api/support/faq/questions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single question by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

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

    // Serialize BigInt
    const serializedQuestion = {
      ...question,
      id: question.id.toString(),
      helpSupportId: question.helpSupportId.toString(),
      support: question.support ? {
        ...question.support,
        id: question.support.id.toString(),
      } : null,
      help_support_quation_answers: question.help_support_quation_answers.map((a) => ({
        ...a,
        id: a.id.toString(),
        helpSupportId: a.helpSupportId.toString(),
        helpSupportQuationId: a.helpSupportQuationId.toString(),
      })),
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
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    // Check if question exists
    const existingQuestion = await prisma.help_support_quations.findUnique({
      where: { id },
    });

    if (!existingQuestion || existingQuestion.isDelete) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.question) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isChatWithus !== undefined) updateData.isChatWithus = body.isChatWithus;
    if (body.helpSupportId) updateData.helpSupportId = BigInt(body.helpSupportId);

    // Update question
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

    // Serialize BigInt
    const serializedQuestion = {
      ...question,
      id: question.id.toString(),
      helpSupportId: question.helpSupportId.toString(),
      support: question.support ? {
        ...question.support,
        id: question.support.id.toString(),
      } : null,
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    // Check if question exists
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

    // Soft delete question
    await prisma.help_support_quations.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    // Also soft delete all related answers
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