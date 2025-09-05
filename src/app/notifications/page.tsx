import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import  NotificationTable  from "@/components/notifications/notifications-table";
import { NotificationSkeleton } from "@/components/notifications/notifications-skeleton";
import { Suspense } from "react";


export default async function NotificationPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; endDate?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Notifications" />

      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationTable/>
      </Suspense>
    </div>
  );
}
