// app/api/user-activities/[userId]/screens/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/firebase";
import moment from "moment";

const DATE_FMT = "DD-MM-YYYY";

type Activity = {
  id: string;
  screenName: string;
  timestamp: Date | null;
};

// 💡 Next 15: params is a Promise now
type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || moment().format(DATE_FMT);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validate date format
    const dateM = moment(date, DATE_FMT, true);
    if (!dateM.isValid()) {
      return NextResponse.json(
        { error: "Invalid date format. Use DD-MM-YYYY" },
        { status: 400 }
      );
    }

    // ⬇️ unwrap params Promise and validate userId
    const { userId: rawUserId } = await context.params;
    const userId = rawUserId?.trim();

    if (!userId || userId === "null" || userId === "undefined") {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get activities from Firebase
    const colRef = db
      .collection("user_activity_logs")
      .doc(date)
      .collection(userId);

    // Main query with quota handling
    let snap;
    try {
      snap = await colRef
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();
    } catch (err: any) {
      if (err?.code === 8 || err?.details?.includes?.("Quota exceeded")) {
        console.error("Firestore quota exceeded for screen activities:", err);
        return NextResponse.json(
          {
            success: false,
            error: "Activity logs quota exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }
      throw err;
    }

    const activities: Activity[] = snap.docs.map((d) => {
      const data = d.data() as any;
      const ts = data?.timestamp?.toDate?.() ?? null;
      return {
        id: d.id,
        screenName: data?.screenName ?? "",
        timestamp: ts,
      };
    });

    // Get total count (best-effort, ignore failures)
    let totalCount: number | undefined;
    try {
      const countSnap = await colRef.count().get();
      totalCount = countSnap.data().count;
    } catch (err) {
      console.warn("Failed to fetch total count for activities:", err);
      totalCount = undefined;
    }

    // Calculate screen frequency
    const screenFrequency = activities.reduce(
      (acc, activity) => {
        const screen = activity.screenName || "Unknown";
        acc[screen] = (acc[screen] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top screens
    const topScreens = Object.entries(screenFrequency)
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate session duration
    const timestamps = activities
      .map((a) => a.timestamp)
      .filter((t): t is Date => t !== null)
      .map((t) => t.getTime());

    const sessionDuration =
      timestamps.length > 1
        ? Math.max(...timestamps) - Math.min(...timestamps)
        : 0;

    // Get last 7 days of activity counts (also quota-safe)
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = moment().subtract(i, "days").format(DATE_FMT);
      try {
        const dayColRef = db
          .collection("user_activity_logs")
          .doc(dayDate)
          .collection(userId);

        const dayCountSnap = await dayColRef.count().get();
        last7Days.push({
          date: dayDate,
          count: dayCountSnap.data().count ?? 0,
        });
      } catch (err: any) {
        if (err?.code === 8 || err?.details?.includes?.("Quota exceeded")) {
          console.error("Firestore quota exceeded in weeklyTrend:", err);
          // Push 0 for this day and stop trying further to avoid more quota hits
          last7Days.push({
            date: dayDate,
            count: 0,
          });
          break;
        }

        last7Days.push({
          date: dayDate,
          count: 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        userId,
        activities: {
          total: totalCount,
          shown: activities.length,
          recent: activities.map((a) => ({
            screenName: a.screenName,
            timestamp: a.timestamp,
          })),
        },
        analytics: {
          topScreens,
          uniqueScreens: Object.keys(screenFrequency).length,
          sessionDurationMs: sessionDuration,
          sessionDurationMinutes: (sessionDuration / (1000 * 60)).toFixed(2),
        },
        weeklyTrend: last7Days,
      },
    });
  } catch (error) {
    console.error("Error fetching screen activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch screen activities" },
      { status: 500 }
    );
  }
}
