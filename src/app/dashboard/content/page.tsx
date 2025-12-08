"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import {
  BookOpen,
  Video,
  FileText,
  Eye,
  TrendingUp,
  Star,
  Users,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function ContentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

  const router = useRouter();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartTitleColor = isDark ? "#F9FAFB" : "#111827";
  const chartTextColor = isDark ? "#9CA3AF" : "#4B5563";
  const chartGridColor = isDark
    ? "rgba(75,85,99,0.2)"
    : "rgba(209,213,219,0.6)";
  const tooltipBgColor = isDark
    ? "rgba(0,0,0,0.85)"
    : "rgba(249,250,251,0.98)";
  const tooltipTitleColor = isDark ? "#F9FAFB" : "#111827";
  const tooltipBodyColor = isDark ? "#E5E7EB" : "#1F2937";
  const tooltipBorderColor = "rgba(255,107,53,0.5)";

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchData();
  }, [filter, customDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (filter === "custom" && customDate.startDate && customDate.endDate) {
        params.append("startDate", customDate.startDate);
        params.append("endDate", customDate.endDate);
      }

      const response = await fetch(`/api/dashboard/content?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch content data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Content Analytics"
          subtitle="Monitor blog performance, videos, horoscopes, and story engagement"
          badge={{ text: "CONTENT", variant: "purple" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Blog Summary */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6B35]" />
            Blog Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Blogs"
              value={data?.blogs.summary.total || 0}
              icon={<BookOpen className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Active Blogs"
              value={data?.blogs.summary.active || 0}
              icon={<BookOpen className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Blog Views"
              value={data?.blogs.summary.views || 0}
              icon={<Eye className="w-5 h-5" />}
              trend={
                data?.blogs.summary.viewsComparison
                  ? {
                    value: data.blogs.summary.viewsComparison.changePercent,
                    isPositive: data.blogs.summary.viewsComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Blog Readers"
              value={data?.blogs.summary.readers || 0}
              icon={<Users className="w-5 h-5" />}
              trend={
                data?.blogs.summary.readersComparison
                  ? {
                    value: data.blogs.summary.readersComparison.changePercent,
                    isPositive: data.blogs.summary.readersComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
          </div>
        </div>

        {/* Most Viewed Blogs */}
        {!loading && data?.blogs.mostViewed && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              Most Viewed Blogs
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.blogs.mostViewed.map((blog: any, index: number) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                    #{index + 1}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={avatar(blog.image)}
                      alt={blog.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                        {blog.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>by {blog.author}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span className="font-bold text-[#FF6B35]">{blog.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Blog Views by Category */}
          {!loading && data?.blogs.byCategory && (
            <PieChart
              data={{
                labels: data.blogs.byCategory.map((c: any) => c.categoryName),
                data: data.blogs.byCategory.map((c: any) => c.totalViews),
              }}
              title="Blog Views by Category"
              height={350}
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}

          {/* Top Authors */}
          {!loading && data?.blogs.topAuthors && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Top Blog Authors
              </h3>
              <div className="space-y-3">
                {data.blogs.topAuthors.map((author: any, index: number) => (
                  <motion.div
                    key={author.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {author.name}
                        </div>
                        <div className="text-xs text-gray-500">{author.blogs} blogs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#FF6B35]">
                        {author.totalViews}
                      </div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Horoscope Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FF6B35]" />
            Horoscope Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Horoscopes"
              value={data?.horoscopes.summary.total || 0}
              icon={<Star className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Daily Views"
              value={data?.horoscopes.summary.dailyViews || 0}
              icon={<Eye className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="User Feedback"
              value={data?.horoscopes.summary.feedback || 0}
              icon={<MessageCircle className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Horoscope Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* By Zodiac */}
          {!loading && data?.horoscopes.byZodiac && (
            <BarChart
              data={{
                labels: data.horoscopes.byZodiac.map((h: any) => h.zodiac),
                datasets: [
                  {
                    label: "Horoscopes",
                    data: data.horoscopes.byZodiac.map((h: any) => h.count),
                  },
                ],
              }}
              title="Horoscopes by Zodiac Sign"
              height={350}
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              gridColor={chartGridColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}

          {/* Feedback Types */}
          {!loading && data?.horoscopes.feedbackTypes && (
            <PieChart
              data={{
                labels: data.horoscopes.feedbackTypes.map((f: any) => f.type),
                data: data.horoscopes.feedbackTypes.map((f: any) => f.count),
              }}
              title="Horoscope Feedback Types"
              height={350}
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}
        </div>

        {/* Video & Stories Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Videos */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FF6B35]" />
              Video Content
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Videos
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.videos.summary.total || 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Videos
                </div>
                <div className="text-3xl font-bold text-[#FF6B35]">
                  {data?.videos.summary.active || 0}
                </div>
              </div>
            </div>
            {data?.videos.recent && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Recent Videos
                </div>
                {data.videos.recent.map((video: any, index: number) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <img
                      src={avatar(video.coverImage)}
                      alt={video.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {video.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Stories */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6B35]" />
              Story Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Stories
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.stories.summary.total || 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Story Views
                </div>
                <div className="text-2xl font-bold text-[#FF6B35]">
                  {data?.stories.summary.views || 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Avg Views
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data?.stories.summary.avgViewsPerStory.toFixed(1) || 0}
                </div>
              </div>
            </div>

            {data?.stories.topCreators && (
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Top Story Creators
                </div>
                <div className="space-y-2">
                  {data.stories.topCreators.map((creator: any, index: number) => (
                    <motion.div
                      key={creator.astrologerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={avatar(creator.profileImage)}
                          alt={creator.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {creator.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#FF6B35]">
                        {creator.storiesCount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Content Creation Trend */}
        {!loading && data?.charts.dailyContentTrend && (
          <LineChart
            data={{
              labels: data.charts.dailyContentTrend.map((item: any) =>
                new Date(item.date).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })
              ),
              datasets: [
                {
                  label: "Blogs",
                  data: data.charts.dailyContentTrend.map((item: any) => item.blogs),
                  borderColor: "rgba(255, 107, 53, 1)",
                },
                {
                  label: "Videos",
                  data: data.charts.dailyContentTrend.map((item: any) => item.videos),
                  borderColor: "rgba(59, 130, 246, 1)",
                },
                {
                  label: "Stories",
                  data: data.charts.dailyContentTrend.map((item: any) => item.stories),
                  borderColor: "rgba(16, 185, 129, 1)",
                },
              ],
            }}
            title="Daily Content Creation Trend"
            height={350}
            titleColor={chartTitleColor}
            textColor={chartTextColor}
            gridColor={chartGridColor}
            tooltipBgColor={tooltipBgColor}
            tooltipTitleColor={tooltipTitleColor}
            tooltipBodyColor={tooltipBodyColor}
            tooltipBorderColor={tooltipBorderColor}
          />
        )}

        {/* Most Viewed Stories */}
        {!loading && data?.stories.mostViewed && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Most Viewed Stories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.stories.mostViewed.map((story: any, index: number) => (
                <motion.div
                  key={story.storyId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={avatar(story.astrologer.profileImage)}
                      alt={story.astrologer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {story.astrologer.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{story.mediaType}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#FF6B35]">
                      <Eye className="w-4 h-4" />
                      <span className="font-bold">{story.views}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}