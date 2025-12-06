import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // Blog Analytics
    const [
      totalBlogs,
      activeBlogs,
      currentBlogViews,
      previousBlogViews,
      blogReaders,
      previousBlogReaders,
    ] = await Promise.all([
      // Total blogs
      prisma.blogs.count({
        where: { isDelete: false },
      }),

      // Active blogs
      prisma.blogs.count({
        where: { isActive: true, isDelete: false },
      }),

      // Current period blog views
      prisma.blogs.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
        _sum: { viewer: true },
      }),

      // Previous period blog views
      prisma.blogs.aggregate({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
        _sum: { viewer: true },
      }),

      // Current period blog readers
      prisma.blog_readers.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period blog readers
      prisma.blog_readers.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),
    ]);

    const blogViewsComparison = calculateComparison(
      Number(currentBlogViews._sum.viewer || 0),
      Number(previousBlogViews._sum.viewer || 0)
    );
    const blogReadersComparison = calculateComparison(blogReaders, previousBlogReaders);

    // Most Viewed Blogs
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

    // Blog Category Performance
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

    // Horoscope Analytics
    const [totalHoroscopes, horoscopeFeedback, dailyHoroscopeViews] = await Promise.all([
      // Total horoscopes
      prisma.horoscopes.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Horoscope feedback
      prisma.horoscopefeedback.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Daily horoscope views (approximated by count)
      prisma.dailyhoroscope.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
    ]);

    // Horoscope by Zodiac Sign
    const horoscopeByZodiac = await prisma.horoscopes.groupBy({
      by: ["zodiac"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
    });

    // Horoscope Feedback Distribution
    const feedbackTypes = await prisma.horoscopefeedback.groupBy({
      by: ["feedbacktype"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
    });

    // Video Content Analytics
    const [totalVideos, activeVideos] = await Promise.all([
      prisma.astrology_videos.count({
        where: { isDelete: false },
      }),
      prisma.astrology_videos.count({
        where: { isActive: true, isDelete: false },
      }),
    ]);

    const recentVideos = await prisma.astrology_videos.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        id: true,
        videoTitle: true,
        youtubeLink: true,
        coverImage: true,
        created_at: true,
      },
    });

    // Astrologer Stories Analytics
    const [totalStories, storyViews] = await Promise.all([
      // Total stories
      prisma.astrologer_stories.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Story views
      prisma.story_view_counts.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
    ]);

    // Most Viewed Stories
    const mostViewedStories = await prisma.story_view_counts.groupBy({
      by: ["storyId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
      orderBy: { _count: { storyId: "desc" } },
      take: 10,
    });

    const storyIds = mostViewedStories.map((s) => s.storyId);
    const storyDetails = await prisma.astrologer_stories.findMany({
      where: { id: { in: storyIds } },
      include: {
        astrologer: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    });

    const mostViewedStoriesWithDetails = mostViewedStories.map((story) => {
      const details = storyDetails.find((s) => s.id === story.storyId);
      return {
        storyId: story.storyId,
        views: story._count,
        mediaType: details?.mediaType,
        astrologer: {
          id: details?.astrologer?.id,
          name: details?.astrologer?.name || "Unknown",
          profileImage: details?.astrologer?.profileImage,
        },
        createdAt: details?.created_at,
      };
    });

    // Daily Content Creation Trend
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

    // Top Authors/Content Creators
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

    // Astrologers with Most Stories
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

    const creatorIds = topStoryCreators
      .map((t) => t.astrologerId)
      .filter(Boolean) as bigint[];
    const creatorDetails = await prisma.astrologers.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, name: true, profileImage: true },
    });

    const topStoryCreatorsWithDetails = topStoryCreators.map((creator) => {
      const details = creatorDetails.find((c) => c.id === creator.astrologerId);
      return {
        astrologerId: creator.astrologerId,
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        storiesCount: creator._count,
      };
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

    return NextResponse.json(response);
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
  } finally {
    await prisma.$disconnect();
  }
}