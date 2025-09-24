///Users/xeoren/gyanitallk-admin/src/components/(astros)/astrologers/astrologer-skeleton.tsx
import { Skeleton } from "@/components/ui-elements/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";

export function AstrologerSkeleton() {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl",
        "bg-white/55 dark:bg-white/[0.06] border border-white/60 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
      ].join(" ")}
    >
      {/* subtle liquid glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.03] dark:to-transparent" />

      <div className="relative p-4 md:p-6">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Astrologer</h2>
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        </div>

        {/* table */}
        <div className="overflow-hidden rounded-xl border border-white/60 dark:border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/60 dark:bg-white/[0.06]">
                <TableHead className="min-w-[220px] text-slate-600 dark:text-slate-300">Name</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Gender</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Requests</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Mobile</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Email</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/60 dark:divide-white/10">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-white/50 dark:hover:bg-white/[0.05] transition">
                  {/* Name + avatar skeleton */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full ring-2 ring-white/70 dark:ring-white/10" />
                      <div className="w-full max-w-[260px]">
                        <Skeleton className="mb-2 h-3 w-40 rounded" />
                        <Skeleton className="h-3 w-28 rounded" />
                      </div>
                    </div>
                  </TableCell>

                  {/* Gender */}
                  <TableCell>
                    <Skeleton className="h-3 w-16 rounded" />
                  </TableCell>

                  {/* Requests */}
                  <TableCell>
                    <Skeleton className="h-3 w-12 rounded" />
                  </TableCell>

                  {/* Mobile */}
                  <TableCell className="text-right sm:text-left">
                    <Skeleton className="ml-auto sm:ml-0 h-3 w-28 rounded" />
                  </TableCell>

                  {/* Email */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-3 w-44 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* footer hint / pagination placeholder */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
