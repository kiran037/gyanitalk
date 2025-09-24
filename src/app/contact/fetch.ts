"use server"
const prisma = require("../../prismaClient");

export async function getContacts(
  {
    page = 1,
    limit = 15,
    search = "",
    startDate,
    endDate,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {

  let startOfToday: Date | undefined;
  let endOfToday: Date | undefined;

  if (startDate) {
    startOfToday = new Date(startDate);
    startOfToday.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    endOfToday = new Date(endDate);
    endOfToday.setHours(23, 59, 59, 999);
  }


  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

    const offset = (page - 1) * limit;
  const baseWhere = {
    isActive: true,
    isDelete: false,
    ...(startDate && endDate && {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    }),

    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
  };
  
  const [contact_us, totalCount] = await Promise.all([
    prisma.contact_us.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: {
          // isDelete: false,   // ✅ only fields that exist in your schema
          // add more filters directly if needed
            contact_name: { contains: search },
            contact_email: { contains: search },
      },
    }),
    prisma.contact_us.count({
      where: {
        // add more filters directly if needed
        contact_name: { contains: search },
        contact_email: { contains: search },
      },
    }),
  ]);

  // ✅ Format Date objects into strings
  const data = contact_us.map((c: any) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
  }));

  return {
    data,
    total: totalCount, // uncomment if you add count query
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
