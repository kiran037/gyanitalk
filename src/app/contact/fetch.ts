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

  try {
    const offset = (page - 1) * limit;
    
    // Build where clause based on ACTUAL schema fields
    const whereClause: any = {
      // Add search conditions if search is not empty
      ...(search && {
        OR: [
          { contact_name: { contains: search, mode: 'insensitive' } },
          { contact_email: { contains: search, mode: 'insensitive' } },
          { contact_message: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // Add date filters if provided
      ...(startDate && endDate && {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      }),
    };

    console.log("Fetching contacts with params:", { page, limit, search, startDate, endDate });
    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    const [contact_us, totalCount] = await Promise.all([
      prisma.contact_us.findMany({
        skip: offset,
        take: limit,
        orderBy: { id: "desc" },
        where: whereClause,
      }),
      prisma.contact_us.count({
        where: whereClause,
      }),
    ]);

    console.log("Fetched contacts:", contact_us.length);
    console.log("Total count:", totalCount);

    // Format Date objects into strings
    const data = contact_us.map((c: any) => ({
      ...c,
      created_at: c.created_at ? c.created_at.toISOString() : null,
      updated_at: c.updated_at ? c.updated_at.toISOString() : null,
    }));

    return {
      data,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error: any) {
    console.error("❌ Error fetching contacts:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    // Handle UTF-8 encoding errors
    if (error.message?.includes("UTF-8") || error.message?.includes("Conversion failed")) {
      console.error("UTF-8 encoding issue detected in database");
      return {
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        error: "Database encoding error. Please contact administrator.",
      };
    }
    
    // Return generic error for other cases
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      error: error.message || "Failed to fetch contacts",
    };
  }
}