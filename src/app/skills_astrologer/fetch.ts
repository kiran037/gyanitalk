"use server";
import prisma from "../../prismaClient"; // import sahi tarike se

// --------------------
// Get Skills
// --------------------
export async function getSkills({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;

  // base condition
  const where: any = {
    isDelete: false,
  };

  // 🔍 Search conditions
  if (search) {
    if (isAlphaSearch) {
      where.OR = [
        { name: { contains: search } },
      ];
    }
  }

  // ✅ Fetch reviews & count
  const [skills, totalCount] = await Promise.all([
    prisma.skills.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    }),

    prisma.skills.count({ where }),
  ]);

  return {
    skills: skills.map((s: any) => ({
      id: s.id,
      name: s.name,
      isActive: s.isActive,
      created_at: s.created_at?.toISOString() || "",
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// --------------------
// Delete Skill
// --------------------
export async function deleteSkill(id: number) {
  try {
    const deleted = await prisma.skills.delete({
      where: { id: BigInt(id) },
    });

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Error deleting Skill:", error);
    return { success: false, message: error.message };
  }
}

// --------------------
// Update Skill
// --------------------
export async function updateSkill(id: number, data: any) {
  try {
    const updatedSkill = await prisma.skills.update({
      where: { id },
      data,
    });

    return { success: true, course: updatedSkill };
  } catch (error: any) {
    console.error("Error updating Skill:", error);
    return { success: false, message: error.message };
  }
}

// --------------------
// Create Skill
// --------------------
export async function createSkill(data: any) {
  try {
    const skillsadd = await prisma.skills.create({
      data: {
        name: data.name,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: data.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: data.modifiedBy ?? 1, // 👈 adjust with session user
      },
    });

    return { success: true, skillsadd };
  } catch (error: any) {
    console.error("Error creating Skill:", error);
    return { success: false, message: error.message };
  }
}

// --------------------
// Toggle Active/Inactive Skills
// --------------------
export async function updateSkillStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.skills.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateSkillStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
