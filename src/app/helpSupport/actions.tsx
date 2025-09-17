"use server";

import { addHelpSupportSubSubCategory,
    updateHelpSupportSubCategory,
    deleteHelpSupportSubCategory,
 } from "@/components/helpSupport/fetch";

 // ---- Add ----
export async function addSubCategoryAction(payload: {
  id?: number;
  supportId: number;
  helpSupportQuationId: number;
  title: string;
  description: string;
  isChatWithus: number; //API ke liye number
}) {
  try {
    const res = await addHelpSupportSubSubCategory({
      ...payload,
      isChatWithus: payload.isChatWithus === 1, // 👈 number → boolean
    });
    return res;
  } catch (error) {
    console.error("Add Help Support Category Error:", error);
    return { success: false, error: "Failed to add sub-category" };
  }
}

// ---- Edit ----
export async function editSubCategoryAction(payload: {
  id: number;
  supportId: number;
  question: string;
  answer: string;
  isChatWithus: number; // 👈 API ke liye number
}) {
  try {
    return await updateHelpSupportSubCategory({
      ...payload,
      isChatWithus: payload.isChatWithus === 1, // 👈 number → boolean
    });
  } catch (error) {
    console.error("Edit Help Support Category Error:", error);
    return { success: false, error: "Failed to edit sub-category" };
  }
}

// ---- Delete ----
export async function deleteSubCategoryAction(id: number) {
  try {
    return await deleteHelpSupportSubCategory(id);
  } catch (error) {
    console.error("Delete Help Support Category Error:", error);
    return { success: false, error: "Failed to delete sub-category" };
  }
}
