"use server"
const prisma = require("../../prismaClient");

export async function getTickets({
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
    // ✅ search condition
  const where: any = {};
  if (search && isAlphaSearch) {
    where.user = { name: { contains: search } };
  }
  if (search && isNumericSearch) {
    where.user = { contactNo: { contains: search } };
  }

  const [tickets, totalCount] = await Promise.all([
    prisma.tickets.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        user: {
          select: {
            name: true,
            contactNo: true,
          },
        },
        help_support: {
          select: {
            name: true,
          },
        },
        ticketreview: true, // get all reviews for each ticket
      },
    }),

    prisma.tickets.count({ where }),
  ]);

return {
    tickets: tickets.map((t: any) => ({
      ...t,
      userName: t.user?.name || null,
      contactNo: t.user?.contactNo || null,
      helpSupportName: t.help_supports?.name || null,
      ticketReview: t.ticketreview || [],
    })),
    totalPages: Math.ceil(totalCount / limit), // ✅ pagination
    currentPage: page,
  };
}

export async function closeTickets(ticketId: number) {
  try {
    const updated = await prisma.tickets.update({
      where: { id: ticketId },
      data: { ticketStatus: "CLOSED" },
    });
    return { success: true, ticket: updated };
  } catch (error) {
    console.error("Error closing ticket:", error);
    return { success: false, error: "Unable to close ticket" };
  }
}