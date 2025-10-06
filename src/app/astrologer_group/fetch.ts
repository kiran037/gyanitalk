"use server";
import prisma from "../../prismaClient";

// ✅ 1️⃣ Get astrologer groups (with count + pagination)
export async function getGroupAstrologer({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const offset = (page - 1) * limit;

  // ✅ Search filter
  const where: any = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

   // ✅ Fetch groups and total count
  const [groups, totalCount] = await Promise.all([
    prisma.astrologer_groups.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        _count: {
          select: { astrologerassign: true }, // ✅ correct relation name
        },
      },
    }),
    prisma.astrologer_groups.count({ where }),
  ]);

   // ✅ Map the result
  return {
    groups: groups.map((g: any) => ({
      ...g,
      astrologerassign_count: g._count.astrologerassign, // ✅ rename for clarity
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getAstrologersByGroup(groupId: number) {
  try {
    if (!groupId) throw new Error("Group ID is required");

    const astrologers = await prisma.astrologer_assign_group.findMany({
      where: { group_id: groupId },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Transform data for frontend
    const result = astrologers.map((a: any, idx: any) => ({
      id: a.id,
      group_id: a.group_id,
      astrologer_id: a.astrologer?.id,
      astrologer_name: a.astrologer?.name,
      index: idx + 1,
    }));

    return result;
  } catch (error: any) {
    console.error("Error fetching astrologers:", error);
    throw new Error(error.message || "Failed to fetch astrologers");
  }
}

export async function removeAstrologerFromGroup(assignId: number) {
  try {
    if (!assignId) throw new Error("Assign ID is required");

    // ✅ Delete the record from astrologer_assign_group
    await prisma.astrologer_assign_group.delete({
      where: { id: assignId },
    });

    return { success: true, message: "Astrologer removed successfully" };
  } catch (error: any) {
    console.error("Error removing astrologer:", error);
    throw new Error(error.message || "Failed to remove astrologer");
  }
}

// ✅ 2️⃣ Add group
export async function addAstrologerGroup(name: string){
  try {
    // Check for duplicate
    const existing = await prisma.astrologer_groups.findFirst({
      where: { name },
    });
    if (existing) throw new Error("Astrologer group already exists");

    // Create new group
    const group = await prisma.astrologer_groups.create({
      data: { 
        name: name,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { success: true, group };
  } catch (error: any) {
    console.error("Error add group astrologer:", error);
    return { success: false, message: error.message };
  }
}

// ✅ 3️⃣ Edit group
export async function editAstrologerGroup({ id, name }: { id: number; name: string }) {
  try {
    // Check if the group exists
    const group = await prisma.astrologer_groups.findUnique({
      where: { id: BigInt(id) },
    });

    if (!group) {
      throw new Error("Astrologer group not found");
    }

    // Update the group
    const updated = await prisma.astrologer_groups.update({
      where: { id: BigInt(id) },
      data: {
        name,
        updated_at: new Date(),
      },
    });

    return updated;
  } catch (error: any) {
    console.error("Error editing astrologer group:", error);
    throw new Error(error.message || "Failed to edit astrologer group");
  }
}

// ✅ 4️⃣ Search astrologers
export async function getAstrologerlist(q: string = "") {
   try {
    const astrologers  = await prisma.astrologers.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { startsWith: q } },
          { contactNo: { startsWith: q } },
        ],
      },
      select: { id: true, name: true },
      take: 50,
    });

    return astrologers ;
  } catch (error: any) {
    console.error("Error fetching astrologer list:", error);
    return { success: false, message: error.message };
  }
}

// ✅ 5️⃣ Assign astrologers to group
export async function assignAstroToGroup(groupId: number, astrologers: number[]) {
  try {
    if (!groupId || !Array.isArray(astrologers)) {
      throw new Error("Missing groupId or astrologer list");
    }

    // Prepare data
    const data = astrologers.map((id) => ({
      astrologerId: id,
      group_id: groupId,
    }));

    // Upsert each astrologer’s group assignment
    for (const entry of data) {
      const existing = await prisma.astrologer_assign_group.findFirst({
        where: { astrologerId: entry.astrologerId, group_id: entry.group_id },
      });

      if (existing) {
        await prisma.astrologer_assign_group.update({
          where: { id: existing.id },
          data: { 
            group_id: entry.group_id,
            updated_at: new Date(),
           },

        });
      } else {
        await prisma.astrologer_assign_group.create({ data: entry });
      }
    }

    return { success: true, message: "Astrologers assigned successfully" };
  } catch (error: any) {
    console.error("Error assigning astrologers:", error);
    return { success: false, message: error.message };
  }
}

// ✅ 6️⃣ Get astrologers in a group
// export async function showAllAstrologer(groupId: number) {
//    try {
//     const astrologers = await prisma.astrologer_assign_group.findMany({
//       where: { group_id: groupId },
//       include: { astrologer: true },
//       orderBy: { id: "asc" },
//     });

//      return astrologers.map((item:any, index: any) => ({
//       index: index + 1,
//       id: item.id,
//       name: item.astrologer.name,
//       astrologerId: item.astrologer.id,
//       groupId: item.group_id,
//     }));

//   } catch (error: any) {
//      console.error("Error fetching group astrologers:", error);
//     throw new Error(error.message || "Failed to fetching group astrologers");
//   }
// }
