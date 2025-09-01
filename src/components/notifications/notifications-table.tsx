import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getNotifications } from "./fetch";
import moment from "moment";
import { isValidImageUrl } from "../functions";

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
            {/* Name */}
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="text-dark dark:text-white font-medium truncate">
                  {item.title || "-"}
                </span>
              </div>
            </TableCell>

            {/* Email */}
            <TableCell>
              <span className="text-dark dark:text-white text-sm">
                {item.description || "-"}
              </span>
            </TableCell>

            {/* Created At */}
            <TableCell>
                <div className="flex justify-center items-center">
                  {/* Edit Button */}
                  <button
                    //onClick={handleEdit}
                    className="flex items-center mr-3 text-blue-600 hover:text-blue-800"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="w-4 h-4 mr-1">✔️</i>
                    Edit
                  </button>

                  {/* Send Button */}
                  <button
                    //onClick={handleSend}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <i className="w-4 h-4 mr-1">📤</i>
                    Send
                  </button>
                </div>

                {/* Example Edit Modal */}
                {/* {showEditModal && (
                  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                      <h2 className="text-lg font-bold mb-4">Edit Notification</h2>
                      <p className="mb-2">Title: {title}</p>
                      <p className="mb-2">Description: {description}</p>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )} */}

                {/* Example Send Modal */}
                {/* {showSendModal && (
                  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                      <h2 className="text-lg font-bold mb-4">Send Notification</h2>
                      <p>Do you want to send notification ID: {id}?</p>
                      <button
                        onClick={() => setShowSendModal(false)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )} */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  );
}
