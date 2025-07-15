import { getDashboardOverview } from "../../fetch";
import { OverviewStatCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const data = await getDashboardOverview();

  return (
    <>

      <div className="space-y-6">

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewStatCard
            title="Customers"
            Icon={icons.Users}
            variant="customers"
            stats={[
              { label: "Total", value: data.totalCustomer.toLocaleString() },
              { label: "Active", value: data.totalActiveCustomer.toLocaleString() },
              { label: "Today New", value: data.todayCustomer, trend: "up" },
            ]}
          />
          <OverviewStatCard
            title="Astrologers"
            Icon={icons.UserCheck}
            variant="astrologers"
            stats={[
              { label: "Total", value: data.totalAstrologer.toLocaleString() },
              { label: "Unverified", value: data.unverifiedAstrologer },
            ]}
          />
          <OverviewStatCard
            title="Live Astrologers"
            Icon={icons.Live}
            variant="live"
            stats={[
              { label: "Total", value: data.totalLiveAstro },
              { label: "Live Chat", value: data.totalLiveChat },
              { label: "Live Call", value: data.totalLiveCall },
            ]}
          />
          <OverviewStatCard
            title="Earnings"
            Icon={icons.Profit}
            variant="earnings"
            stats={[
              { label: "Total", value: `₹${data.totalEarning.toLocaleString()}` },
              { label: "Today", value: `₹${data.todayEarning.toFixed(2)}`, trend: "up" },
              { label: "Astro Total", value: `₹${data.totalAstroEarning.toLocaleString()}` },
              { label: "Astro Today", value: `₹${data.todayAstroEarning.toFixed(2)}` },
            ]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <OverviewStatCard
            title="Call Requests"
            Icon={icons.Call}
            variant="calls"
            stats={[
              { label: "Total Requests", value: data.totalCallRequest.toLocaleString() },
              { label: "Completed Req", value: data.totalCallCompleteRequest.count.toLocaleString() },
              { label: "Completed Time", value: `${data.totalCallCompleteRequest.time.toLocaleString()} min` },
              { label: "Today's Req", value: data.todayCallRequest, trend: "neutral" },
              { label: "Today's Time", value: `${data.todayCallRequestTime} min` },
              { label: "Rejected Today", value: data.todayCallRequestReject, trend: "down" },
            ]}
          />
          <OverviewStatCard
            title="Chat Requests"
            Icon={icons.Chat}
            variant="chats"
            stats={[
              { label: "Total Requests", value: data.totalChatRequest.toLocaleString() },
              { label: "Completed Req", value: data.totalChatComplteRequest.count.toLocaleString() },
              { label: "Completed Time", value: `${data.totalChatComplteRequest.time.toLocaleString()} min` },
              { label: "Today's Req", value: data.todayChatRequest, trend: "up" },
              { label: "Today's Time", value: `${data.todayChatRequestTime} min` },
              { label: "Rejected Today", value: data.todayChatRequestReject, trend: "down" },
            ]}
          />
        </div>
      </div>
    </>
  )
}
