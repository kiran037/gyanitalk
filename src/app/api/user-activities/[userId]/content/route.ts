// app/api/user-activities/[userId]/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context); // ✅ unwrap params + validate

    const [
      horoscopeFeedback,
      storyViews,
      kundalis,
      kundaliMatchings,
      intakeForms,
      coursePurchases,
    ] = await Promise.all([
      // Horoscope feedback
      prisma.horoscopefeedback.findMany({
        where: { userId: Number(userId) },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Story views with astrologer details
      prisma.story_view_counts.findMany({
        where: { userId: Number(userId) },
        include: {
          story: {
            include: {
              astrologer: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Kundalis created
      prisma.kundalis.findMany({
        where: { createdBy: Number(userId), isDelete: false },
        orderBy: { created_at: "desc" },
      }),

      // Kundali matchings
      prisma.kundali_matchings.findMany({
        where: { userId: Number(userId), isDelete: false },
        orderBy: { created_at: "desc" },
      }),

      // Intake forms (consultation requests)
      prisma.intakeform.findMany({
        where: { userId: Number(userId) },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Course purchases
      prisma.course_purchase.findMany({
        where: { user_id: Number(userId), status: 1 },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
    ]);

    // Group horoscope feedback by type
    const feedbackByType = horoscopeFeedback.reduce(
      (acc, fb) => {
        const type = fb.feedbacktype || "general";
        if (!acc[type]) acc[type] = [];
        acc[type].push(fb);
        return acc;
      },
      {} as Record<string, typeof horoscopeFeedback>
    );

    return NextResponse.json({
      success: true,
      data: {
        horoscope: {
          totalFeedback: horoscopeFeedback.length,
          byType: Object.keys(feedbackByType).map((type) => ({
            type,
            count: feedbackByType[type].length,
          })),
          recentFeedback: horoscopeFeedback.slice(0, 10).map((fb) => ({
            id: fb.id,
            feedback: fb.feedback,
            type: fb.feedbacktype,
            createdAt: fb.created_at,
          })),
        },
        stories: {
          totalViews: storyViews.length,
          recent: storyViews.map((sv) => ({
            id: sv.id,
            storyId: sv.storyId,
            astrologer: {
              id: sv.story.astrologer?.id.toString(),
              name: sv.story.astrologer?.name,
              profileImage: sv.story.astrologer?.profileImage,
            },
            viewedAt: sv.created_at,
          })),
        },
        kundali: {
          total: kundalis.length,
          kundalis: kundalis.map((k) => ({
            id: k.id.toString(),
            name: k.name,
            gender: k.gender,
            birthDate: k.birthDate,
            birthPlace: k.birthPlace,
            createdAt: k.created_at,
            pdfLink: k.pdf_link,
          })),
        },
        kundaliMatching: {
          total: kundaliMatchings.length,
          matchings: kundaliMatchings.map((km) => ({
            id: km.id.toString(),
            boyName: km.boyName,
            girlName: km.girlName,
            createdAt: km.created_at,
          })),
        },
        consultations: {
          total: intakeForms.length,
          recent: intakeForms.map((form) => ({
            id: form.id,
            name: form.name,
            topic: form.topicOfConcern,
            birthDate: form.birthDate,
            createdAt: form.created_at,
          })),
        },
        courses: {
          total: coursePurchases.length,
          purchased: coursePurchases.map((cp) => ({
            id: cp.id,
            courseId: cp.course_id,
            courseName: cp.course.name,
            courseImage: cp.course.image,
            price: cp.price,
            purchasedAt: cp.created_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user content engagement:", error);
    return NextResponse.json(
      { error: "Failed to fetch user content engagement" },
      { status: 500 }
    );
  }
}
