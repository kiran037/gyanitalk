import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 🔹 Helper: convert BigInt / Decimal / Date → JSON-safe
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
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // --- 1. PARALLEL AGGREGATES (Counts & Sums) ---
    const [
      totalBlogs,
      activeBlogs,
      currentBlogViews,
      previousBlogViews,
      blogReaders,
      previousBlogReaders,
      totalHoroscopes, 
      horoscopeFeedback, 
      dailyHoroscopeViews,
      totalVideos, 
      activeVideos,
      totalStories, 
      storyViews
    ] = await Promise.all([
      // Blogs
      prisma.blogs.count({ where: { isDelete: false } }),
      prisma.blogs.count({ where: { isActive: true, isDelete: false } }),
      prisma.blogs.aggregate({
        where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate }, isDelete: false },
        _sum: { viewer: true },
      }),
      prisma.blogs.aggregate({
        where: { created_at: { gte: previousRange.startDate, lte: previousRange.endDate }, isDelete: false },
        _sum: { viewer: true },
      }),
      prisma.blog_readers.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      prisma.blog_readers.count({ where: { created_at: { gte: previousRange.startDate, lte: previousRange.endDate } } }),
      
      // Horoscopes
      prisma.horoscopes.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      prisma.horoscopefeedback.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      prisma.dailyhoroscope.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),

      // Videos
      prisma.astrology_videos.count({ where: { isDelete: false } }),
      prisma.astrology_videos.count({ where: { isActive: true, isDelete: false } }),

      // Stories
      prisma.astrologer_stories.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      prisma.story_view_counts.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
    ]);

    const blogViewsComparison = calculateComparison(
      Number(currentBlogViews._sum.viewer || 0),
      Number(previousBlogViews._sum.viewer || 0)
    );
    const blogReadersComparison = calculateComparison(blogReaders, previousBlogReaders);

    // --- 2. BLOG LISTS ---
    const mostViewedBlogs = await prisma.blogs.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      orderBy: { viewer: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        blogImage: true,
        author: true,
        viewer: true,
        created_at: true,
        blogCategoryId: true,
      },
    });

    // Blog Categories (Manual Join)
    const blogsByCategory = await prisma.blogs.groupBy({
      by: ["blogCategoryId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        blogCategoryId: { not: null },
        isDelete: false,
      },
      _count: true,
      _sum: { viewer: true },
    });

    const categoryIds = blogsByCategory
      .map((b) => b.blogCategoryId)
      .filter(Boolean) as bigint[];
      
    const categoryDetails = await prisma.blog_categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const blogsByCategoryWithDetails = blogsByCategory.map((blog) => {
      const details = categoryDetails.find((c) => c.id === blog.blogCategoryId);
      return {
        categoryId: blog.blogCategoryId,
        categoryName: details?.name || "Uncategorized",
        count: blog._count,
        totalViews: Number(blog._sum.viewer || 0),
      };
    });

    // --- 3. HOROSCOPES & VIDEOS ---
    const horoscopeByZodiac = await prisma.horoscopes.groupBy({
      by: ["zodiac"],
      where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } },
      _count: true,
    });

    const feedbackTypes = await prisma.horoscopefeedback.groupBy({
      by: ["feedbacktype"],
      where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } },
      _count: true,
    });

    const recentVideos = await prisma.astrology_videos.findMany({
      where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate }, isDelete: false },
      orderBy: { created_at: "desc" },
      take: 10,
      select: { id: true, videoTitle: true, youtubeLink: true, coverImage: true, created_at: true },
    });

    // --- 4. STORIES & ASTROLOGERS (Manual Join Fix) ---
    
    // A. Most Viewed Stories
    const mostViewedStories = await prisma.story_view_counts.groupBy({
      by: ["storyId"],
      where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } },
      _count: true,
      orderBy: { _count: { storyId: "desc" } },
      take: 10,
    });

    const storyIds = mostViewedStories.map((s) => s.storyId);
    
    // Fetch raw stories to get astrologerId
    const storyDetails = await prisma.astrologer_stories.findMany({
      where: { id: { in: storyIds } },
      select: { id: true, mediaType: true, created_at: true, astrologerId: true }
    });

    // B. Top Story Creators
    const topStoryCreators = await prisma.astrologer_stories.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        astrologerId: { not: null },
      },
      _count: true,
      orderBy: { _count: { astrologerId: "desc" } },
      take: 10,
    });

    // C. Collect ALL Astrologer IDs to fetch details once
    const allAstroIds = new Set<bigint>();
    
    storyDetails.forEach(s => { if(s.astrologerId) allAstroIds.add(s.astrologerId) });
    topStoryCreators.forEach(t => { if(t.astrologerId) allAstroIds.add(t.astrologerId) });

    // D. Fetch Astrologer Details with User Profile Fallback
    const astroMap = new Map();
    if (allAstroIds.size > 0) {
        const astros = await prisma.astrologers.findMany({
            where: { id: { in: Array.from(allAstroIds) } },
            select: { 
                id: true, 
                name: true, 
                profileImage: true,
                users: { select: { profile: true } } // Fallback image
            }
        });

        astros.forEach(a => {
            const img = a.profileImage || a.users?.profile || null;
            astroMap.set(a.id.toString(), {
                name: a.name,
                profileImage: img
            });
        });
    }

    // E. Stitch Most Viewed Stories
    const mostViewedStoriesWithDetails = mostViewedStories.map((story) => {
      const details = storyDetails.find((s) => s.id === story.storyId);
      const astroId = details?.astrologerId?.toString();
      const astroInfo = astroId ? astroMap.get(astroId) : null;

      return {
        storyId: story.storyId,
        views: story._count,
        mediaType: details?.mediaType,
        astrologer: {
          id: details?.astrologerId,
          name: astroInfo?.name || "Unknown",
          profileImage: astroInfo?.profileImage,
        },
        createdAt: details?.created_at,
      };
    });

    // F. Stitch Top Creators
    const topStoryCreatorsWithDetails = topStoryCreators.map((creator) => {
      const idStr = creator.astrologerId?.toString();
      const info = idStr ? astroMap.get(idStr) : null;
      
      return {
        astrologerId: creator.astrologerId,
        name: info?.name || "Unknown",
        profileImage: info?.profileImage,
        storiesCount: creator._count,
      };
    });

    // --- 5. CHARTS (Raw Query) ---
    const dailyContentTrend = await prisma.$queryRaw<
      Array<{ date: Date; blogs: number; videos: number; stories: number }>
    >`
      SELECT 
        DATE(date_col) as date,
        SUM(CASE WHEN source = 'blogs' THEN 1 ELSE 0 END) as blogs,
        SUM(CASE WHEN source = 'videos' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN source = 'stories' THEN 1 ELSE 0 END) as stories
      FROM (
        SELECT created_at as date_col, 'blogs' as source FROM blogs 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate} AND isDelete = false
        UNION ALL
        SELECT created_at, 'videos' FROM astrology_videos 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate} AND isDelete = false
        UNION ALL
        SELECT created_at, 'stories' FROM astrologer_stories 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
      ) as combined
      GROUP BY DATE(date_col)
      ORDER BY date ASC
    `;

    // Top Blog Authors (Simple GroupBy)
    const topAuthors = await prisma.blogs.groupBy({
      by: ["author"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _count: true,
      _sum: { viewer: true },
      orderBy: { _count: { author: "desc" } },
      take: 10,
    });

    const response: DashboardResponse = {
      success: true,
      data: {
        blogs: {
          summary: {
            total: totalBlogs,
            active: activeBlogs,
            views: Number(currentBlogViews._sum.viewer || 0),
            viewsComparison: blogViewsComparison,
            readers: blogReaders,
            readersComparison: blogReadersComparison,
          },
          mostViewed: mostViewedBlogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            image: blog.blogImage,
            author: blog.author,
            views: Number(blog.viewer || 0),
            createdAt: blog.created_at,
          })),
          byCategory: blogsByCategoryWithDetails,
          topAuthors: topAuthors.map((author) => ({
            name: author.author,
            blogs: author._count,
            totalViews: Number(author._sum.viewer || 0),
          })),
        },
        horoscopes: {
          summary: {
            total: totalHoroscopes,
            dailyViews: dailyHoroscopeViews,
            feedback: horoscopeFeedback,
          },
          byZodiac: horoscopeByZodiac.map((h) => ({
            zodiac: h.zodiac,
            count: h._count,
          })),
          feedbackTypes: feedbackTypes.map((f) => ({
            type: f.feedbacktype || "Unknown",
            count: f._count,
          })),
        },
        videos: {
          summary: {
            total: totalVideos,
            active: activeVideos,
          },
          recent: recentVideos.map((video) => ({
            id: video.id,
            title: video.videoTitle,
            link: video.youtubeLink,
            coverImage: video.coverImage,
            createdAt: video.created_at,
          })),
        },
        stories: {
          summary: {
            total: totalStories,
            views: storyViews,
            avgViewsPerStory: totalStories > 0 ? storyViews / totalStories : 0,
          },
          mostViewed: mostViewedStoriesWithDetails,
          topCreators: topStoryCreatorsWithDetails,
        },
        charts: {
          dailyContentTrend: dailyContentTrend.map((d) => ({
            date: d.date,
            blogs: Number(d.blogs),
            videos: Number(d.videos),
            stories: Number(d.stories),
            total: Number(d.blogs) + Number(d.videos) + Number(d.stories),
          })),
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    return NextResponse.json(convertPrismaTypes(response));
  } catch (error) {
    console.error("Content dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch content analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}