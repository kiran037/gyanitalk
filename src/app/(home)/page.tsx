import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import MonthlyDashboardChart from "./_components/charts/chart";

export const dynamic = "force-dynamic"; 

export default async function Home() {

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <MonthlyDashboardChart />
    </>
  );
}
