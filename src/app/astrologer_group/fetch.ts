"use server";
import prisma from "../../prismaClient";
import { Prisma } from "@prisma/client"; // for Prisma.join and types

/* ---- minimal types for strong inference ---- */
const groupSelect = {
  id: true,
  name: true,
  created_at: true,
  updated_at: true,
} as const;

type GroupRow = Prisma.astrologer_groupsGetPayload<{ select: typeof groupSelect }>;
type CountRow = { group_id: number; c: bigint | number };

/* ✅ 1️⃣ Get astrologer groups (with count + pagination) */
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

  // search filter (no mode: "insensitive")
  const where: any = {};
  if (search) where.name = { contains: search };

  const [groups, totalCount]: [GroupRow[], number] = await Promise.all([
    prisma.astrologer_groups.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      select: groupSelect,
    }) as Promise<GroupRow[]>,
    prisma.astrologer_groups.count({ where }),
  ]);

  // fast counts via single SQL
  const ids = groups.map((g: GroupRow) => Number(g.id));
  let countMap = new Map<number, number>();

  if (ids.length) {
    const rows = await prisma.$queryRaw<CountRow[]>`
      SELECT group_id, COUNT(*) AS c
      FROM astrologer_assign_group
      WHERE group_id IN (${Prisma.join(ids)})
      GROUP BY group_id
    `;
    countMap = new Map(rows.map((r: CountRow) => [Number(r.group_id), Number(r.c)]));
  }

return {
  groups: groups.map((g: GroupRow) => ({
    ...g,
    id: Number(g.id), // 👈 ensure number for client/UI
    astrologerassign_count: countMap.get(Number(g.id)) ?? 0,
  })),
  totalPages: Math.ceil(totalCount / limit),
  currentPage: page,
};

}

export async function getAstrologersByGroup(groupId: number) {
  try {
    if (groupId == null) throw new Error("Group ID is required");

    const gid = Number(groupId); 

    const astrologers = await prisma.astrologer_assign_group.findMany({
      where: { group_id: gid },   
      include: { astrologer: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });

    return astrologers.map(
      (a: { id: number; group_id: number; astrologer?: { id: number; name: string } }, idx: number) => ({
        id: a.id,
        group_id: a.group_id,
        astrologer_id: a.astrologer?.id,
        astrologer_name: a.astrologer?.name,
        index: idx + 1,
      })
    );
  } catch (error: any) {
    console.error("Error fetching astrologers:", error);
    throw new Error(error.message || "Failed to fetch astrologers");
  }
}


export async function removeAstrologerFromGroup(assignId: number) {
  try {
    if (!assignId) throw new Error("Assign ID is required");
    await prisma.astrologer_assign_group.delete({ where: { id: assignId } });
    return { success: true, message: "Astrologer removed successfully" };
  } catch (error: any) {
    console.error("Error removing astrologer:", error);
    throw new Error(error.message || "Failed to remove astrologer");
  }
}

/* ✅ 2️⃣ Add group */
export async function addAstrologerGroup(name: string) {
  try {
    const existing = await prisma.astrologer_groups.findFirst({ where: { name } });
    if (existing) throw new Error("Astrologer group already exists");

    const group = await prisma.astrologer_groups.create({
      data: { name, created_at: new Date(), updated_at: new Date() },
    });

    return { success: true, group };
  } catch (error: any) {
    console.error("Error add group astrologer:", error);
    return { success: false, message: error.message };
  }
}

/* ✅ 3️⃣ Edit group */
export async function editAstrologerGroup({ id, name }: { id: number; name: string }) {
  try {
    const pk = BigInt(id); // groups.id is BigInt in your schema
    const group = await prisma.astrologer_groups.findUnique({ where: { id: pk } });
    if (!group) throw new Error("Astrologer group not found");

    return prisma.astrologer_groups.update({
      where: { id: pk },
      data: { name, updated_at: new Date() },
    });
  } catch (error: any) {
    console.error("Error editing astrologer group:", error);
    throw new Error(error.message || "Failed to edit astrologer group");
  }
}

/* ✅ 4️⃣ Search astrologers */
export async function getAstrologerlist(q: string = "") {
  try {
    const astrologers = await prisma.astrologers.findMany({
      where: {
        isActive: true,
        OR: [{ name: { startsWith: q } }, { contactNo: { startsWith: q } }],
      },
      select: { id: true, name: true },
      take: 50,
    });
    return astrologers;
  } catch (error: any) {
    console.error("Error fetching astrologer list:", error);
    return { success: false, message: error.message };
  }
}

/* ✅ 5️⃣ Assign astrologers to group */
export async function assignAstroToGroup(groupId: number, astrologers: number[]) {
  try {
    if (!groupId || !Array.isArray(astrologers)) {
      throw new Error("Missing groupId or astrologer list");
    }

    for (const id of astrologers) {
      const existing = await prisma.astrologer_assign_group.findFirst({
        where: { astrologerId: id, group_id: groupId },
      });

      if (existing) {
        await prisma.astrologer_assign_group.update({
          where: { id: existing.id },
          data: { group_id: groupId, updated_at: new Date() },
        });
      } else {
        await prisma.astrologer_assign_group.create({
          data: { astrologerId: id, group_id: groupId, created_at: new Date(), updated_at: new Date() },
        });
      }
    }

    return { success: true, message: "Astrologers assigned successfully" };
  } catch (error: any) {
    console.error("Error assigning astrologers:", error);
    return { success: false, message: error.message };
  }
}

/* ✅ 6️⃣ Delete group (and its assignments) */
export async function deleteAstrologerGroup(id: number) {
  try {
    if (id == null) throw new Error("Group ID is required");

    // Remove child rows first (if your FK isn’t ON DELETE CASCADE)
    await prisma.astrologer_assign_group.deleteMany({
      where: { group_id: Number(id) },
    });

    // Then delete the group (id is BigInt in your schema)
    await prisma.astrologer_groups.delete({
      where: { id: BigInt(id) },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting astrologer group:", error);
    return { success: false, message: error.message || "Failed to delete astrologer group" };
  }
}
