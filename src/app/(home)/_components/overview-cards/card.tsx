import { Card, CardContent, CardHeader } from "@/components/ui-elements/shadcn-card";
import type React from "react"

export function OverviewStatCard({
  title,
  Icon,
  stats,
  variant = "default",
}: {
  title: string
  Icon: React.ElementType
  stats: { label: string; value: string | number; trend?: "up" | "down" | "neutral" }[]
  variant?: "default" | "customers" | "astrologers" | "live" | "earnings" | "calls" | "chats"
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "customers":
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950",
          iconColor: "text-blue-600 dark:text-blue-400",
          accent: "border-l-blue-500",
        }
      case "astrologers":
        return {
          iconBg: "bg-purple-50 dark:bg-purple-950",
          iconColor: "text-purple-600 dark:text-purple-400",
          accent: "border-l-purple-500",
        }
      case "live":
        return {
          iconBg: "bg-green-50 dark:bg-green-950",
          iconColor: "text-green-600 dark:text-green-400",
          accent: "border-l-green-500",
        }
      case "earnings":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950",
          iconColor: "text-amber-600 dark:text-amber-400",
          accent: "border-l-amber-500",
        }
      case "calls":
        return {
          iconBg: "bg-cyan-50 dark:bg-cyan-950",
          iconColor: "text-cyan-600 dark:text-cyan-400",
          accent: "border-l-cyan-500",
        }
      case "chats":
        return {
          iconBg: "bg-indigo-50 dark:bg-indigo-950",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          accent: "border-l-indigo-500",
        }
      default:
        return {
          iconBg: "bg-gray-50 dark:bg-gray-950",
          iconColor: "text-gray-600 dark:text-gray-400",
          accent: "border-l-gray-500",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${styles.accent} hover:scale-[1.02] bg-white`}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${styles.iconBg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between group/stat">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/stat:scale-105 transition-transform">
                  {stat.value}
                </span>
              
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
