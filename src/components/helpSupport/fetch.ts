"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");
import { HelpSupportCategory } from "./HelpSupportAccordion";

// Get Help Support
export async function getHelpSupport() {
  const help_supports = await prisma.help_supports.findMany({
    where: {isDelete: false},
    orderBy: { id: "asc" },
  });

  // Map Date fields to ISO strings for serialization
  const data = help_supports.map((item: any) => ({
    ...item,
    created_at: item.created_at ? item.created_at.toISOString() : null,
    updated_at: item.updated_at ? item.updated_at.toISOString() : null,
  }));

  return data;
}

// ✅ Add Help Support 
export async function addHelpSupport(payload: {
  name: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.help_supports.create({
      data: {
        name: payload.name,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: payload.createdBy ?? 1,
      },
    });

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Add Help Support Error:", error);
    return { success: false, message: "Failed to create help support"};
  }
}

// Edit Help Support
export async function editHelpSupport(
  id: number,
  payload: {
    name: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.help_supports.update({
      where: { id },
      data: {
        name: payload.name,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Update Help Support Error:", error);
    return { success: false, message: "Failed to update Help Support" };
  }
}

// Delete Help Support
export async function deleteHelpSupport(id: number) {
  try {
    // soft delete related sub-questions
    await prisma.help_support_quations.updateMany({
      where: { helpSupportId: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });

    // soft delete related answers
    await prisma.help_support_quation_answers.updateMany({
      where: { helpSupportId: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });

    // soft delete main help_support
    const deleted = await prisma.help_supports.update({
      where: { id: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });
    
    return { success: true, data: deleted };
  } catch (err: any) {
    console.error("delete Help Support error:", err);
    return { success: false, message: "Failed to delete Help Support" };
  }
}

// Get Help Support SubCategory
export async function getHelpSupportSubCategories(supportId: number): Promise<{ subCategories: HelpSupportCategory[] }> {
  const data = await prisma.help_support_quations.findMany({
    where: { helpSupportId: supportId, isDelete: false },
     include: {
      help_support_quation_answers: true,
    },
    orderBy: { id: "desc" },
  });

   // 👇 Transform DB -> categories[]
  const subCategories: HelpSupportCategory[] = data.map((item: any) => ({
    id: item.id,
    helpSupportId: item.helpSupportId,
    question: item.question,
    answer: item.answer,
    isChatWithus: item.isChatWithus === 1, // boolean me convert
  }));

  return { subCategories };
}

// Add Help Support SubCategory
export async function addHelpSupportSubCategory(payload: {
  supportId: number;
  subCategory: string;
  description: string;
  isChatWithUs: boolean;
  createdBy?: number;
}){
  try {
    const created = await prisma.help_support_quations.create({
      data: {
        helpSupportId: payload.supportId,
        question: payload.subCategory,
        answer: payload.description,
        isChatWithus: payload.isChatWithUs ? 1 : 0, // ✅ boolean → 1/0
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: payload.createdBy ?? 1,
      },
    });
    return { success: true, data: created };
  } catch (error: any) {
    console.error("Add Help Support Category Error:", error);
    return { success: false, message: "Failed to create help support category"};
  }
}

// Update Help Support SubCategory
export async function updateHelpSupportSubCategory(payload: {
  id?: number;
  supportId: number;
  question: string;
  answer: string;
  isChatWithus?: boolean;
  createdBy?: number;
}) {
  try {
    if (!payload.id) throw new Error("ID is required for update");
    const subCategoryUpdated = await prisma.help_support_quations.update({
      where: { id: payload.id },
      data: {
        helpSupportId: payload.supportId,
        question: payload.question,
        answer: payload.answer,
        isChatWithus: payload.isChatWithus ? 1 : 0, // 👈 bool → int
        updated_at: new Date(),
        modifiedBy: 1,
      },
    });

    return { success: true, data: subCategoryUpdated };
  } catch (error) {
    console.error("Update Help Support Category Error:", error);
    return { success: false, message: "Failed to update help support category" };
  }
}

// Delete (Soft Delete) Sub Category
export async function deleteHelpSupportSubCategory(id: number) {
  try {

    // ✅ First check if question exists
    const helpSupportQuestion = await prisma.help_support_quations.findUnique({
      where: { id },
    });

    if (!helpSupportQuestion) {
      return { success: false, message: "Question not found" };
    }

    // ✅ Delete related answers first
    await prisma.help_support_quation_answers.updateMany({
      where: { helpSupportQuationId: id },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });

    // ✅ Delete the question itself
    await prisma.help_support_quations.update({
      where: { id },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });

    return { success: true, message: "Deleted successfully" };
  } catch (error: any) {
    console.error("Delete Help Support Category Error:", error);
    return { success: false, message: "Failed to delete help support category"  };
  }
}

// Get Help Support Sub SubCategory
export async function getHelpSupportSubSubCategories(supportId?: number) {
  try {
    const whereClause: any = {};
    if (supportId) whereClause.helpSupportQuationId = supportId;

    const subsubCategories = await prisma.help_support_quation_answers.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
    });

    return subsubCategories.map((item: any) => ({
      id: item.id,
      helpSupportId: item.helpSupportId,
      helpSupportQuationId: item.helpSupportQuationId,
      title: item.title,
      description: item.description || "",
      isChatWithus: item.isChatWithus,
    }));
  } catch (error) {
    console.error("❌ Fetch HelpSupportSubSubCategories Error:", error);
    return [];
  }
}

// Add Help Support Sub SubCategory
export async function addHelpSupportSubSubCategory(payload: {
  supportId: number;
  helpSupportQuationId: number;
  title: string;
  description: string;
  isChatWithus?: boolean;
  createdBy?: number;
}){
  try {
  const subCategoryAdded = await prisma.help_support_quation_answers.create({
      data: {
        helpSupportId: payload.supportId,
        helpSupportQuationId: payload.helpSupportQuationId,
        title: payload.title,
        description: payload.description,
        isChatWithus: payload.isChatWithus ? 1 : 0, // ✅ convert Boolean → Int
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1,
        modifiedBy: payload.createdBy ?? 1,
      },
    });
    return { success: true, data: subCategoryAdded };
  } catch (error: any) {
    console.error("Add Help Support Category Error:", error);
    return { success: false, message: "Failed to add help support category"};
  }
}



