import Image from "next/image"
import Link from "next/link"
import { TrashIcon } from "@/assets/icons"
import { PreviewIcon } from "../astrologers/icons"
import { getAiAstro } from "./fetch"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table"
import { FeaturedStatusToggle } from "./FeaturedStatusToggle"

export async function AiAstrologerTable({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number
  limit?: number
  search?: string
}) {
  const { astrologers, totalPages, currentPage } = await getAiAstro({
    page,
    limit,
    search,
  })

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-dark-3 dark:bg-gray-900 sm:p-8 p-4 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 [&>th]:py-4 [&>th]:text-sm [&>th]:font-semibold [&>th]:tracking-wide">
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Total Req.</TableHead>
              <TableHead>Chat Charge</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>AI Type</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {astrologers.map((item, index) => (
              <TableRow
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 rounded-xl"
              >
                <TableCell>
                  <Link
                    href={`/astrologers/${item.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                      <Image
                        src={
                          item.image
                            ? `${process.env.NEXT_PUBLIC_BASEURL}${item.image}`
                            : "https://gyanitalk.com/build/assets/images/person.png"
                        }
                        alt={item.name || "User"}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name || "-"}
                    </span>
                  </Link>
                </TableCell>

                <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                  {item.totalChatRequest || "0"}
                </TableCell>

                <TableCell className="text-sm font-medium text-primary">
                  ₹{item.chat_charge || "0"}
                </TableCell>

                <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                  {item.experience || "0"} yrs
                </TableCell>

                <TableCell>
                  <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-800/40 dark:to-purple-700/30 dark:text-purple-200">
                    {item.aiType || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <FeaturedStatusToggle
                    id={item.id}
                    featured={item.featured === 1}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/ai-astrologers/${item.id}`}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
                      title="Preview"
                    >
                      <PreviewIcon className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/40 dark:hover:bg-red-800/40 dark:text-red-300 transition"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1
          const isLast = pageNum === totalPages
          const isCurrent = pageNum === currentPage
          const shouldShow =
            pageNum <= 2 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <span key={i} className="px-2 text-gray-400">
                  ...
                </span>
              )
            }
            return null
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={cn(
                "px-4 py-1.5 rounded-full border transition font-medium",
                isCurrent
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          )
        })}
      </div>
    </div>
  )
}
