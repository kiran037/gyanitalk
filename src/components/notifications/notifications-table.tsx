import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui-elements/table";
import { getNotifications } from "./fetch";

export async function NotificationTable({}) {
  const { data} = await getNotifications();

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      
      <Table className="table table-report -mt-2" aria-label="notification">
        <TableHeader className="sticky-top">
          <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="whitespace-nowrap">TITLE</TableHead>
            <TableHead className="whitespace-nowrap">DESCRIPTION</TableHead>
            <TableHead className="text-center whitespace-nowrap">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {data.map((item: any, index: number) => (
          <TableRow
            key={index} className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="text-dark dark:text-white font-medium truncate">
                  {item.title || "-"}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-dark dark:text-white text-sm">
                {item.description || "-"}
              </span>
            </TableCell>

            <TableCell>
                <div className="flex justify-center items-center">
                  <button
                    className="flex items-center mr-3 text-blue-600 hover:text-blue-800"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="w-4 h-4 mr-1">✔️</i>
                    Edit
                  </button>

                  <button className="flex items-center text-green-600 hover:text-green-800">
                    <i className="w-4 h-4 mr-1">📤</i>
                    Send
                  </button>
                </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  );
}
