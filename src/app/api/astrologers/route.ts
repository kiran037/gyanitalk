import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const isVerified = searchParams.get("isVerified");
    const isActive = searchParams.get("isActive");
    const skill = searchParams.get("skill");
    const chatStatus = searchParams.get("chatStatus");
    const callStatus = searchParams.get("callStatus");

    // Build where clause
    const where: any = { isDelete: false };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ];
    }

    if (isVerified !== null && isVerified !== undefined && isVerified !== "") {
      where.isVerified = isVerified === "true";
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    if (skill) {
      where.OR = [
        { primarySkill: { contains: skill } },
        { allSkill: { contains: skill } },
      ];
    }

    if (chatStatus) where.chatStatus = chatStatus;
    if (callStatus) where.callStatus = callStatus;

    // 1. Fetch RAW Astrologers (No includes to avoid broken joins)
    const [allAstrologers, total] = await Promise.all([
      prisma.astrologers.findMany({
        where,
        // Fetch ALL necessary fields directly
        select: {
          id: true,
          userId: true, // Crucial for manual join
          name: true,
          email: true,
          contactNo: true,
          profileImage: true,
          isVerified: true,
          isActive: true,
          chatStatus: true,
          callStatus: true,
          isLiveOff: true,
          charge: true,
          videoCallRate: true,
          experienceInYears: true,
          primarySkill: true,
          allSkill: true,
          languageKnown: true,
          totalOrder: true,
          top_select: true,
          featured_select: true,
          created_at: true,
        },
      }),
      prisma.astrologers.count({ where }),
    ]);

    // 2. Extract IDs for Manual Fetching
    const userIds = new Set<string>();
    const astroIds = new Set<string>();

    allAstrologers.forEach(a => {
      if (a.userId) userIds.add(a.userId.toString());
      if (a.id) astroIds.add(a.id.toString());
    });

    // 3. Manual Fetch - USER Details (Fallback for name/image)
    const userMap = new Map();
    if (userIds.size > 0) {
      const users = await prisma.users.findMany({
        where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
        select: { id: true, name: true, email: true, contactNo: true, profile: true }
      });
      users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // 4. Manual Fetch - WALLET Transactions (For Balance)
    const walletMap = new Map<string, number>();
    if (astroIds.size > 0) {
      // Group by astrologerId to get sum directly (much faster)
      // Note: Prisma aggregate doesn't support groupBy well for this specific calculation 
      // without raw query, so we'll fetch light objects and reduce in memory
      const transactions = await prisma.wallettransaction.findMany({
        where: { 
            astrologerId: { in: Array.from(astroIds).map(id => BigInt(id)) } 
        },
        select: { astrologerId: true, amount: true, isCredit: true }
      });

      transactions.forEach(t => {
        const aId = t.astrologerId?.toString();
        if (aId) {
            const current = walletMap.get(aId) || 0;
            const amt = Number(t.amount || 0);
            walletMap.set(aId, t.isCredit ? current + amt : current - amt);
        }
      });
    }

    // 5. Manual Fetch - FOLLOWERS Count
    const followerMap = new Map<string, number>();
    if (astroIds.size > 0) {
      // Use aggregate to count efficiently
      const followers = await prisma.astrologer_followers.groupBy({
        by: ['astrologerId'],
        where: {
            astrologerId: { in: Array.from(astroIds).map(id => BigInt(id)) },
            isDelete: false,
            isActive: true
        },
        _count: { userId: true }
      });
      
      followers.forEach(f => {
        followerMap.set(f.astrologerId.toString(), f._count.userId);
      });
    }

    // 6. Stitch Everything Together
    const astrologersWithData = allAstrologers.map((astrologer) => {
      const userIdStr = astrologer.userId?.toString();
      const user = userIdStr ? userMap.get(userIdStr) : null;
      
      const astroIdStr = astrologer.id.toString();
      const walletBalance = walletMap.get(astroIdStr) || 0;
      const followerCount = followerMap.get(astroIdStr) || 0;

      // RESOLVE NAME & IMAGE
      // Priority: Astrologer Table -> User Table -> Unknown
      const finalName = astrologer.name || user?.name || "Unknown";
      const finalEmail = astrologer.email || user?.email || "";
      const finalContact = astrologer.contactNo || user?.contactNo || "";
      const finalImage = astrologer.profileImage || user?.profile || null;

      return {
        ...astrologer,
        name: finalName,
        email: finalEmail,
        contactNo: finalContact,
        profileImage: finalImage,
        // Attach user object for frontend compatibility if needed
        users: user ? {
            name: user.name,
            email: user.email,
            contactNo: user.contactNo,
            profile: user.profile
        } : null,
        followerCount,
        walletBalance: walletBalance.toFixed(2),
      };
    });

    // 7. Sort Logic (Same as before)
    const sortedAstrologers = astrologersWithData.sort((a, b) => {
      const aTopAndVerified = a.top_select === 1 && a.isVerified;
      const bTopAndVerified = b.top_select === 1 && b.isVerified;

      const aOnlyVerified = a.isVerified && a.top_select === 0;
      const bOnlyVerified = b.isVerified && b.top_select === 0;

      if (aTopAndVerified && !bTopAndVerified) return -1;
      if (!aTopAndVerified && bTopAndVerified) return 1;

      if (aOnlyVerified && !bOnlyVerified && !bTopAndVerified) return -1;
      if (!aOnlyVerified && bOnlyVerified && !aTopAndVerified) return 1;

      if (b.followerCount !== a.followerCount) {
        return b.followerCount - a.followerCount;
      }

      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });

    // Stats
    const stats = {
      totalVerified: sortedAstrologers.filter((a) => a.isVerified).length,
      totalActive: sortedAstrologers.filter((a) => a.isActive).length,
      totalOnline: sortedAstrologers.filter((a) => a.chatStatus === "online").length,
      totalCallOnline: sortedAstrologers.filter((a) => a.callStatus === "online").length,
    };

    // Pagination
    const paginatedAstrologers = sortedAstrologers.slice(skip, skip + limit);

    const safeData = convertPrismaTypes(paginatedAstrologers);
    const safeStats = convertPrismaTypes(stats);

    return NextResponse.json({
      success: true,
      data: safeData,
      stats: safeStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching astrologers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST method remains unchanged
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "contactNo",
      "gender",
      "birthDate",
      "primarySkill",
      "allSkill",
      "languageKnown",
      "charge",
      "experienceInYears",
      "dailyContribution",
      "whyOnBoard",
      "interviewSuitableTime",
      "mainSourceOfBusiness",
      "highestQualification",
      "astrologerCategoryId",
      "minimumEarning",
      "maximumEarning",
      "NoofforeignCountriesTravel",
      "currentlyworkingfulltimejob",
      "goodQuality",
      "whatwillDo",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user exists or create new user
    let userId: bigint;

    if (body.userId) {
      userId = BigInt(body.userId);
      const existingUser = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }
    } else {
      // Create new user
      const newUser = await prisma.users.create({
        data: {
          name: body.name,
          email: body.email,
          contactNo: body.contactNo,
          gender: body.gender,
          birthDate: new Date(body.birthDate),
          isActive: true,
          isDelete: false,
        },
      });
      userId = newUser.id;
    }

    // Create astrologer
    const newAstrologer = await prisma.astrologers.create({
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
        name: body.name,
        email: body.email,
        contactNo: body.contactNo,
        gender: body.gender,
        birthDate: new Date(body.birthDate),
        primarySkill: body.primarySkill,
        allSkill: body.allSkill,
        languageKnown: body.languageKnown,
        profileImage:
          body.profileImage && body.profileImage.trim() !== ""
            ? body.profileImage
            : null,
        charge: parseInt(body.charge),
        actualCharge: parseInt(body.actualCharge ?? body.charge),
        experienceInYears: parseInt(body.experienceInYears),
        dailyContribution: parseInt(body.dailyContribution),
        hearAboutAstroguru: body.hearAboutAstroguru || null,
        isWorkingOnAnotherPlatform: body.isWorkingOnAnotherPlatform || false,
        whyOnBoard: body.whyOnBoard,
        interviewSuitableTime: body.interviewSuitableTime,
        currentCity: body.currentCity || null,
        mainSourceOfBusiness: body.mainSourceOfBusiness,
        highestQualification: body.highestQualification,
        degree: body.degree || null,
        college: body.college || null,
        learnAstrology: body.learnAstrology || null,
        astrologerCategoryId: body.astrologerCategoryId,
        instaProfileLink: body.instaProfileLink || null,
        facebookProfileLink: body.facebookProfileLink || null,
        linkedInProfileLink: body.linkedInProfileLink || null,
        youtubeChannelLink: body.youtubeChannelLink || null,
        websiteProfileLink: body.websiteProfileLink || null,
        isAnyBodyRefer: body.isAnyBodyRefer || false,
        minimumEarning: parseInt(body.minimumEarning),
        maximumEarning: parseInt(body.maximumEarning),
        loginBio: body.loginBio || null,
        NoofforeignCountriesTravel: body.NoofforeignCountriesTravel,
        currentlyworkingfulltimejob: body.currentlyworkingfulltimejob,
        goodQuality: body.goodQuality,
        biggestChallenge: body.biggestChallenge || null,
        whatwillDo: body.whatwillDo,
        isVerified: body.isVerified || false,
        totalOrder: body.totalOrder || 0,
        country: body.country || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isDelete: false,
        createdBy: body.createdBy || 0,
        modifiedBy: body.modifiedBy || 0,
        nameofplateform: body.nameofplateform || null,
        monthlyEarning: body.monthlyEarning || null,
        referedPerson: body.referedPerson || null,
        chatStatus: body.chatStatus || "offline",
        chatWaitTime: body.chatWaitTime || null,
        callStatus: body.callStatus || "offline",
        callWaitTime: body.callWaitTime || null,
        videoCallRate: body.videoCallRate || null,
        reportRate: body.reportRate || null,
        chat_sorting: body.chat_sorting || 0,
        chat_select: body.chat_select || 0,
        call_sorting: body.call_sorting || 0,
        call_select: body.call_select || 0,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Astrologer created successfully",
      data: newAstrologer,
    });

    return NextResponse.json(safe, { status: 201 });
  } catch (error: any) {
    console.error("Error creating astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create astrologer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}