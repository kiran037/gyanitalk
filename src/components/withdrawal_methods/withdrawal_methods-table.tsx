"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CheckSquare } from "lucide-react";
import { WithdrawMethodStatusToggle } from "./updateWithdrawMethodsStatus";
import { editWithdrawalMethods } from "./fetch";

type WithdrawMethod = {
  id: number;
  method_name: string;
  isActive: boolean;
};

interface Props {
  methods: WithdrawMethod[];
}

export default function WithdrawalMethodsTable({ methods }: Props) {
  console.log("✅ methods prop:", methods);
  const [data, setData] = useState<WithdrawMethod[]>(methods);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);

  // edit button → edit modal open karo
  const handleEdit = (id: number, name: string, isActive: boolean) => {
    setSelectedMethod({ id, method_name: name, isActive });
    setIsEditOpen(true);
  };

  // submit edit modal
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;

    // 👇 direct function call
    const res = await editWithdrawalMethods(selectedMethod.id, {
      method_name: selectedMethod.method_name,
    });

    if (res.success) {
    toast.success("✅ Method updated successfully!");
    setIsEditOpen(false);

    // update local state
    setData((prev) =>
      prev.map((m) =>
        m.id === selectedMethod.id
          ? { ...m, method_name: selectedMethod.method_name }
          : m
      )
    );
    } else {
      toast.error("❌ Failed to update");
    }
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">METHOD NAME</TableHead>
            <TableHead className="text-center">STATUS</TableHead>
            <TableHead className="text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              
              {/* Method Name */}
              <TableCell className="text-center font-bold">{item.method_name}</TableCell>

              {/* Status Toggle */}
              <TableCell className="text-center">
                <div className="form-check form-switch flex justify-center items-center">
                  <WithdrawMethodStatusToggle id={item.id} status={item.isActive} />
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => handleEdit(item.id, item.method_name, item.isActive)}
                    className="flex items-center mr-3 text-blue-600 hover:underline"
                  >
                  <CheckSquare className="editbtn w-4 h-4 mr-1" /> Edit
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {methods.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No Withdrawal Methods found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ================= Edit Modal ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Edit Method</h2>
              <button onClick={() => setIsEditOpen(false)}>✖</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <input type="hidden" value={selectedMethod?.id || ""} />

              <div className="mb-4">
                <label className="block text-sm font-medium">Method Name</label>
                <input
                  type="text"
                  value={selectedMethod?.method_name || ""}
                  onChange={(e) =>
                    setSelectedMethod((prev) =>
                      prev ? { ...prev, method_name: e.target.value } : prev
                    )
                  }
                  required
                  className="w-full border p-2 rounded"
                  placeholder="Name"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit"  className="px-4 py-2 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}