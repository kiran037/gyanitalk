// "use server"
// const prisma = require("@/prismaClient");

// export async function getAstrologers({
//   page = 1,
//   limit = 15,
//   search = "",
//   sortBy = "id",
//   sortOrder = "desc",
//   isVerifiedKey,
// }: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   sortBy?: string;
//   sortOrder?: string;
//   isVerifiedKey?: string;
// }) {
//   const offset = (page - 1) * limit;
//   const isNumericSearch = /^\d+$/.test(search);
//   const isAlphaSearch = /[a-zA-Z]/.test(search);
//   const whereClause = {
//     isDelete: false,
//     ...(search &&
//       isAlphaSearch && {
//       name: { contains: search },
//     }),
//     ...(search &&
//       isNumericSearch && {
//       contactNo: { contains: search },
//     }),
//     ...(isVerifiedKey === "true" && { isVerified: true }),
//     ...(isVerifiedKey === "false" && { isVerified: false }),
//   };

//   const shouldSort =
//     sortBy && (sortOrder === "asc" || sortOrder === "desc");


//   const [astrologers, totalCount] = await Promise.all([
//     prisma.astrologers.findMany({
//       skip: offset,
//       take: limit,
//       ...(shouldSort && {
//         orderBy: { [sortBy]: sortOrder },
//       }),
//       where: whereClause,
//     }),

//     prisma.astrologers.count({ where: whereClause }),
//   ]);

//   const astrologersWithStats = await Promise.all(
//     astrologers.map(async (astro: any) => {
//       const [reviews, totalCall, totalChat] = await Promise.all([
//         prisma.user_reviews.findMany({
//           where: { astrologerId: astro.id },
//           select: { rating: true },
//         }),
//         prisma.callrequest.count({ where: { astrologerId: astro.id } }),
//         prisma.chatrequest.count({ where: { astrologerId: astro.id } }),
//       ]);

//       const avgRating = reviews.length > 0
//         ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length
//         : null;

//       return {
//         ...astro,
//         rating: avgRating,
//         totalCallRequest: totalCall,
//         totalChatRequest: totalChat,
//       };
//     })
//   );

//   return {
//     astrologers: astrologersWithStats,
//     total: totalCount,
//     totalPages: Math.ceil(totalCount / limit),
//     currentPage: page,
//   };
// }


// export async function updateLiveStatus({ id, isLiveOff }: UpdateLiveStatusProps) {
//   const updated = await prisma.astrologers.update({
//     where: { id },
//     data: { isLiveOff },
//   });

// }

// export async function updateVerifyStatus({ id, isVerified }: UpdateVerifiedStatusProps) {

//   const updated = await prisma.astrologers.update({
//     where: { id },
//     data: { isVerified: !isVerified },
//   });

// }

// export async function updateAstrologerDetails({ id, data }: { id: number; data: any }) {
//   try {
//     const updated = await prisma.astrologers.update({
//       where: { id: Number(id) },
//       data: {
//         name: data.name,
//         email: data.email,
//         contactNo: data.contactNo,
//         profileImage: data.profileImage,
//         is_featured: Number(data.is_featured) || 0,
//         gender: data.gender,
//         birthDate: data.birthDate ? new Date(data.birthDate) : undefined,

//         astrologerCategoryId: data.astrologerCategoryId,
//         primarySkill: data.primarySkill,
//         allSkill: data.allSkill,
//         languageKnown: data.languageKnown,
//         minimumEarning: data.minimumEarning ? Number(data.minimumEarning) : undefined,
//         charge: data.charge ? Number(data.charge) : undefined,
//         videoCallRate: data.videoCallRate ? Number(data.videoCallRate) : undefined,
//         reportRate: data.reportRate ? Number(data.reportRate) : undefined,
//         experienceInYears: data.experienceInYears ? Number(data.experienceInYears) : undefined,

//         updated_at: new Date(),
//       },
//     });
//     return { status: true, message: "Astrologer updated successfully", data: updated };
//   } catch (err: any) {
//     console.error("updateAstrologerDetails error:", err);
//     return { status: false, message: err.message };
//   }
// }



// export async function getProfileDetails({ id }: { id?: any }) {
//   const astroDetail = await prisma.astrologers.findFirst({
//     where: { id: Number(id) },
//   });

//   const callHistory = await prisma.callrequest.findMany({
//     where: {
//       astrologerId: Number(id),
//     },
//     orderBy: {
//       id: 'desc',
//     },
//     include: {
//       user: {
//         select: {
//           name: true,
//           contactNo: true,
//           profile: true,
//         },
//       },
//       astrologer: {
//         select: {
//           name: true,
//           charge: true,
//         },
//       },
//     },
//   });


//   const chatHistory = await prisma.chatrequest.findMany({
//     where: {
//       astrologerId: Number(id),
//     },
//     orderBy: {
//       id: 'desc',
//     },
//     include: {
//       user: {
//         select: {
//           name: true,
//           contactNo: true,
//           profile: true,
//         },
//       },
//       astrologer: {
//         select: {
//           name: true,
//           charge: true,
//         },
//       },
//     },
//   });

//   const walletTransactions = await prisma.wallettransaction.findMany({
//     where: {
//       astrologerId: Number(id),
//     },
//     orderBy: {
//       id: 'desc',
//     },
//     include: {
//       order_request: {
//         select: {
//           totalMin: true,
//           user: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const followersCount = await prisma.astrologer_followers.count({
//     where: { astrologerId: Number(id) },
//   });

//   const followersList = await prisma.astrologer_followers.findMany({
//     where: { astrologerId: Number(id) },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           contactNo: true,
//           profile: true,
//         },
//       },
//     },
//   });

//   const astrologer_gifts_raw = await prisma.astrologer_gifts.findMany({
//     where: {
//       astrologerId: Number(id),
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           contactNo: true,
//           profile: true,
//         },
//       },
//       gift: {
//         select: {
//           id: true,
//           name: true,
//           image: true,
//         },
//       },
//     },
//   });

//   // Convert Decimal to number
//   const gifts = astrologer_gifts_raw.map((item: any) => ({
//     ...item,
//     giftAmount: item.giftAmount?.toNumber() ?? null,
//   }));
//   const astroAvailability = await prisma.astrologer_availabilities.findMany({
//     where: { astrologerId: Number(id) },
//   });

//   const notification = await prisma.user_notifications.findMany({
//     where: { userId: Number(astroDetail.userId) }
//   });
//   const gallery = await prisma.astrologers_gallery.findMany({
//     where: { astrologerId: Number(id) }
//   });

//   const totalCallMinutes = callHistory.reduce((sum: number, req: any) => {
//     const min = Number(req.totalMin) || 0;
//     return sum + min;
//   }, 0);

//   const totalChatMinutes = chatHistory.reduce((sum: number, req: any) => {
//     const min = Number(req.totalMin) || 0;
//     return sum + min;
//   }, 0);

//   return {
//     astroDetail,
//     callHistory,
//     chatHistory,
//     walletTransactions,
//     totalCallMinutes,
//     totalChatMinutes,
//     followersCount,
//     followersList,
//     astroAvailability,
//     notification,
//     gifts,
//     gallery
//   };
// }




// export async function unFollow({ id }: any) {
//   const deleted = await prisma.astrologer_followers.delete({
//     where: { id },
//   });
// }

// export async function verifyGallery({ id, status }: any) {
//   const updated = await prisma.astrologers_gallery.update({
//     where: { id },
//     data: { status }
//   });

//   console.log(updated);

// }




// type UpdateLiveStatusProps = {
//   id: number;
//   isLiveOff: 0 | 1;
// };
// type UpdateVerifiedStatusProps = {
//   id: number;
//   isVerified: boolean;
// };

"use server";

const prisma = require("@/prismaClient");

/* ===========================
 * Queries
 * =========================== */

export async function getAstrologers({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "id",
  sortOrder = "desc",
  isVerifiedKey,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  isVerifiedKey?: string;
}) {
  const offset = (page - 1) * limit;
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const whereClause = {
    isDelete: false,
    ...(search && isAlphaSearch && { name: { contains: search } }),
    ...(search && isNumericSearch && { contactNo: { contains: search } }),
    ...(isVerifiedKey === "true" && { isVerified: true }),
    ...(isVerifiedKey === "false" && { isVerified: false }),
  };

  const shouldSort = !!(sortBy && (sortOrder === "asc" || sortOrder === "desc"));

  const [astrologers, totalCount] = await Promise.all([
    prisma.astrologers.findMany({
      skip: offset,
      take: limit,
      ...(shouldSort && { orderBy: { [sortBy]: sortOrder } }),
      where: whereClause,
    }),
    prisma.astrologers.count({ where: whereClause }),
  ]);

  const astrologersWithStats = await Promise.all(
    astrologers.map(async (astro: any) => {
      const [reviews, totalCall, totalChat] = await Promise.all([
        prisma.user_reviews.findMany({
          where: { astrologerId: astro.id },
          select: { rating: true },
        }),
        prisma.callrequest.count({ where: { astrologerId: astro.id } }),
        prisma.chatrequest.count({ where: { astrologerId: astro.id } }),
      ]);

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length
          : null;

      return {
        ...astro,
        rating: avgRating,
        totalCallRequest: totalCall,
        totalChatRequest: totalChat,
      };
    })
  );

  return {
    astrologers: astrologersWithStats,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ===========================
 * Mutations (Status Toggles)
 * =========================== */

export type UpdateLiveStatusProps = {
  id: number;
  /** 0 = LIVE (on), 1 = OFF (hidden) */
  isLiveOff: 0 | 1;
};

export type UpdateVerifiedStatusProps = {
  id: number;
  isVerified: boolean;
};

/** LIVE toggle (0 on / 1 off) – returns updated row */
export async function updateLiveStatus({ id, isLiveOff }: UpdateLiveStatusProps) {
  return prisma.astrologers.update({
    where: { id },
    data: { isLiveOff },
  });
}

/** VERIFY toggle – SET what UI sends (no extra invert) */
export async function updateVerifyStatus({ id, isVerified }: UpdateVerifiedStatusProps) {
  return prisma.astrologers.update({
    where: { id },
    data: { isVerified },
  });
}

/** CHAT status: boolean -> "Online"/"Offline" */
export async function updateChatStatus({
  id,
  on,
}: {
  id: number;
  on: boolean;
}) {
  const chatStatus: "Online" | "Offline" = on ? "Online" : "Offline";
  return prisma.astrologers.update({
    where: { id },
    data: { chatStatus },
  });
}

/** CALL status: boolean -> "Online"/"Offline" */
export async function updateCallStatus({
  id,
  on,
}: {
  id: number;
  on: boolean;
}) {
  const callStatus: "Online" | "Offline" = on ? "Online" : "Offline";
  return prisma.astrologers.update({
    where: { id },
    data: { callStatus },
  });
}

/* ===========================
 * Other existing mutations
 * =========================== */

export async function updateAstrologerDetails({ id, data }: { id: number; data: any }) {
  try {
    const updated = await prisma.astrologers.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        email: data.email,
        contactNo: data.contactNo,
        profileImage: data.profileImage,
        is_featured: Number(data.is_featured) || 0,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,

        astrologerCategoryId: data.astrologerCategoryId,
        primarySkill: data.primarySkill,
        allSkill: data.allSkill,
        languageKnown: data.languageKnown,
        minimumEarning: data.minimumEarning ? Number(data.minimumEarning) : undefined,
        charge: data.charge ? Number(data.charge) : undefined,
        videoCallRate: data.videoCallRate ? Number(data.videoCallRate) : undefined,
        reportRate: data.reportRate ? Number(data.reportRate) : undefined,
        experienceInYears: data.experienceInYears ? Number(data.experienceInYears) : undefined,

        updated_at: new Date(),
      },
    });
    return { status: true, message: "Astrologer updated successfully", data: updated };
  } catch (err: any) {
    console.error("updateAstrologerDetails error:", err);
    return { status: false, message: err.message };
  }
}

/* ===========================
 * Profile details (unchanged)
 * =========================== */

export async function getProfileDetails({ id }: { id?: any }) {
  const astroDetail = await prisma.astrologers.findFirst({
    where: { id: Number(id) },
  });

  const callHistory = await prisma.callrequest.findMany({
    where: { astrologerId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: { select: { name: true, charge: true } },
    },
  });

  const chatHistory = await prisma.chatrequest.findMany({
    where: { astrologerId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: { select: { name: true, charge: true } },
    },
  });

  const walletTransactions = await prisma.wallettransaction.findMany({
    where: { astrologerId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      order_request: {
        select: {
          totalMin: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  const followersCount = await prisma.astrologer_followers.count({
    where: { astrologerId: Number(id) },
  });

  const followersList = await prisma.astrologer_followers.findMany({
    where: { astrologerId: Number(id) },
    include: {
      user: { select: { id: true, name: true, contactNo: true, profile: true } },
    },
  });

  const astrologer_gifts_raw = await prisma.astrologer_gifts.findMany({
    where: { astrologerId: Number(id) },
    include: {
      user: { select: { id: true, name: true, contactNo: true, profile: true } },
      gift: { select: { id: true, name: true, image: true } },
    },
  });

  const gifts = astrologer_gifts_raw.map((item: any) => ({
    ...item,
    giftAmount: item.giftAmount?.toNumber() ?? null,
  }));

  const astroAvailability = await prisma.astrologer_availabilities.findMany({
    where: { astrologerId: Number(id) },
  });

  const notification = await prisma.user_notifications.findMany({
    where: { userId: Number(astroDetail.userId) },
  });

  const gallery = await prisma.astrologers_gallery.findMany({
    where: { astrologerId: Number(id) },
  });

  const totalCallMinutes = callHistory.reduce((sum: number, req: any) => {
    const min = Number(req.totalMin) || 0;
    return sum + min;
  }, 0);

  const totalChatMinutes = chatHistory.reduce((sum: number, req: any) => {
    const min = Number(req.totalMin) || 0;
    return sum + min;
  }, 0);

  return {
    astroDetail,
    callHistory,
    chatHistory,
    walletTransactions,
    totalCallMinutes,
    totalChatMinutes,
    followersCount,
    followersList,
    astroAvailability,
    notification,
    gifts,
    gallery,
  };
}

/* ===========================
 * Other existing helpers
 * =========================== */

export async function unFollow({ id }: any) {
  return prisma.astrologer_followers.delete({ where: { id } });
}

export async function verifyGallery({ id, status }: any) {
  const updated = await prisma.astrologers_gallery.update({
    where: { id },
    data: { status },
  });
  console.log(updated);
  return updated;
}
