"use server";

import { addHelpSupportSubSubCategory,
    updateHelpSupportSubSubCategory,
    deleteHelpSupportSubSubCategory,
    updateHelpSupportSubCategory,
    deleteHelpSupportSubCategory,
 } from "@/components/helpSupport/fetch";

// ---- Add Sub Sub category ----
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

// ---- Edit Sub Sub category ----
export async function editSubSubCategoryAction(payload: {
  id: number;
  supportId: number;
  helpSupportQuationId: number;
  title: string;
  description: string;
  isChatWithus: number; //API ke liye number
}) {
  try {
    const res = await updateHelpSupportSubSubCategory({
      id: payload.id,
      helpSupportId: payload.supportId,
      helpSupportQuationId: payload.helpSupportQuationId,
      title: payload.title,
      description: payload.description,
      isChatWithus: payload.isChatWithus,
    });

    return res;
  } catch (error) {
    console.error("Edit Help Support Sub Category Error:", error);
    return { success: false, error: "Failed to edit sub-sub-category" };
  }
}

// ---- Delete Sub Sub category ----
export async function deleteSubSubCategoryAction(id: number){
  try {
    const res = await deleteHelpSupportSubSubCategory(id);
    return res;
  } catch (error) {
    console.error("Delete Help Support Sub Category Error:", error);
    return { success: false, error: "Failed to delete sub-sub-category" };
  }
}

// ---- Edit Sub Category ----
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

// ---- Delete Sub Category ----
export async function deleteSubCategoryAction(id: number) {
  try {
    return await deleteHelpSupportSubCategory(id);
  } catch (error) {
    console.error("Delete Help Support Category Error:", error);
    return { success: false, error: "Failed to delete sub-category" };
  }
}
