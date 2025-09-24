///Users/xeoren/gyanitallk-admin/src/components/transactions/transaction-skeleton.tsx
import { Skeleton } from "@/components/ui-elements/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";

export function TransactionsSkeleton() {
  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="px-4 py-6 text-2xl font-bold text-dark dark:text-white md:px-6 xl:px-9">
        Transactions
      </h2>

      <Table>
        <TableHeader>
          <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
            <TableHead className="min-w-[120px]">Name</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>TOB</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={100}>
                <Skeleton className="h-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
