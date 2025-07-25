import { getDashboardOverview } from "../../fetch";
import { OverviewStatCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const data = await getDashboardOverview();

  return (
    <>
      {/* General Overview Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <OverviewStatCard
            title="Customers"
            Icon={icons.Users}
            variant="customers"
            stats={[
              { label: "Total", value: data.totalCustomer.toLocaleString(), path: 'customers' },
              { label: "Active", value: data.totalActiveCustomer.toLocaleString() },
              { label: "Report Req.", value: data.totalReportRequest.toLocaleString() },
            ]}
          />
          <OverviewStatCard
            title="Astrologers"
            Icon={icons.UserCheck}
            variant="astrologers"
            stats={[
              { label: "Total", value: data.totalAstrologer.toLocaleString() },
              { label: "Unverified", value: data.unverifiedAstrologer },
              { label: "Total Orders", value: data.totalOrders },
            ]}
          />
          <OverviewStatCard
            title="Live Astrologers"
            Icon={icons.Live}
            variant="live"
            stats={[
              { label: "Live Astrologers", value: data.totalLiveAstro },
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
              { label: "Astro Total", value: `₹${data.totalAstroEarning.toLocaleString()}` },
              { label: "Total Withdraw", value: `₹${data.totalWithdraw.toLocaleString()}` },
            ]}
          />
          <OverviewStatCard
            title="Deposit"
            Icon={icons.Profit}
            variant="earnings"
            stats={[
              { label: "Total Deposit", value: `₹${((data.totalDeposit['success'] ?? 0) + (data.totalDeposit['pending'] ?? 0)).toLocaleString()}` },
              { label: "Total Success", value: `₹${data.totalDeposit['success'].toLocaleString()}` },
              { label: "Total Pending", value: `₹${data.totalDeposit['pending'].toLocaleString()}` },
            ]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <OverviewStatCard
            title="Call Requests"
            Icon={icons.Call}
            variant="calls"
            stats={[
              { label: "Total Requests", value: data.totalCallRequest.toLocaleString() },
              { label: "Completed Req", value: data.totalCallCompleteRequest.count.toLocaleString() },
              { label: "Completed Time", value: `${data.totalCallCompleteRequest.time.toLocaleString()} min` },
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
            ]}
          />
          <OverviewStatCard
            title="Expert Astro Match"
            Icon={icons.Chat}
            variant="chats"
            stats={[
              { label: "Total Req", value: (data.successRequests + data.pendingRequests) },
              { label: "Assigned Req", value: data.successRequests },
              { label: "Pending Req", value: data.pendingRequests },
            ]}
          />
        </div>
      </div>

      {/* Today's Overview Section */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Today’s Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <OverviewStatCard
            title="New Customers"
            Icon={icons.Users}
            variant="customers"
            stats={[
              {
                label: "Today New", value: data.todayCustomer,
                path: `customers?startDate=${new Date().toISOString().slice(0, 10)}&endDate=${new Date().toISOString().slice(0, 10)}`

              },
            ]}
          />
          <OverviewStatCard
            title="Today Earnings"
            Icon={icons.Profit}
            variant="earnings"
            stats={[
              { label: "Today", value: `₹${data.todayEarning.toFixed(2)}`, },
              { label: "Astro Today", value: `₹${data.todayAstroEarning.toFixed(2)}` },
              { label: "Today Withdraw", value: `₹${data.todayWithdraw.toLocaleString()}` },

            ]}
          />
          <OverviewStatCard
            title="Call Activity"
            Icon={icons.Call}
            variant="calls"
            stats={[
              { label: "Today's Req", value: data.todayCallRequest, },
              { label: "Today's Time", value: `${data.todayCallRequestTime} min` },
              { label: "Rejected Today", value: data.todayCallRequestReject, },
            ]}
          />
          <OverviewStatCard
            title="Chat Activity"
            Icon={icons.Chat}
            variant="chats"
            stats={[
              { label: "Today's Req", value: data.todayChatRequest, },
              { label: "Today's Time", value: `${data.todayChatRequestTime} min` },
              { label: "Rejected Today", value: data.todayChatRequestReject, },
            ]}
          />
          <OverviewStatCard
            title="Deposit"
            Icon={icons.Profit}
            variant="earnings"
            stats={[
              { label: "Total Deposit", value: `₹${((data.todayDeposit['success'] ?? 0) + (data.todayDeposit['pending'] ?? 0)).toLocaleString()}` },
              { label: "Total Success", value: `₹${data.todayDeposit['success'].toLocaleString()}` },
              { label: "Total Pending", value: `₹${data.todayDeposit['pending'].toLocaleString()}` },
            ]}
          />
        </div>
      </div>
    </>
  );
}
