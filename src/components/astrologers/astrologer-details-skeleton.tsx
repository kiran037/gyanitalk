"use client";

import { Skeleton } from "../ui-elements/skeleton";

export default function AstroDetailsSkeleton() {
  return (
    <div className="mx-auto w-full">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm border dark:bg-gray-dark dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Profile Photo */}
            <div className="flex items-center space-x-5">
              <Skeleton className="w-[90px] h-[90px] rounded-full" />
              <div>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Stats Overview */}
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Astrologer Rates */}
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="p-6">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}


export function ListSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ))}
    </div>
  );
}

