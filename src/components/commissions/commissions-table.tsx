"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { createCommission, getCommissions, updateCommission } from "./fetch";
import { Plus,CheckSquare } from "lucide-react";

interface Commission {
  id: number;
  astrologerId: number;
  commissionTypeId: number;
  commission: number;
  astrologerName: string;
  commissionType: string;
  isActive: boolean;
  isDelete: boolean;
  createdBy?: number;
  modifiedBy?: number;
}

interface CommissionType {
  id: number;
  name: string;
}

interface Astrologer {
  id: number;
  name: string;
  contactNo: string;
}

type Props = {
  commissions: Commission[];
  commissionTypes: CommissionType[];
  astrologers: Astrologer[];
  page: number;
  totalPages: number;
  currentPage: number;
}

export default function CommissionsTable({ 
  commissions,
  commissionTypes,
  astrologers,
  page,
  totalPages,
  currentPage}: Props) {

  const [loading, setLoading] = useState(false);
  const [commissionList, setCommissionList] = useState<Commission[]>(
    commissions || []
  );

  // form states
  const [commissionTypeId, setCommissionTypeId] = useState<number>(0);
  const [astrologerId, setAstrologerId] = useState<number>(0);
  const [commissionValue, setCommissionValue] = useState<number | string>("");

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(
    null
  );
 
  // add modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch commissions
  const fetchCommission = async () => {
    try {
      setLoading(true);
      const res = await getCommissions({ page }); // 👈 pass filters
      setCommissionList(res.commissions || []);
    } catch (error) {
      console.error("Failed to fetch commissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommission();
  }, [page]);

// save handler (add or edit)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionTypeId || !astrologerId || !commissionValue) {
      alert("All fields are required!");
      return;
    }

    try {
      if (editingCommission) {
        await updateCommission(editingCommission.id, {
          commissionTypeId,
          astrologerId,
          commission: Number(commissionValue),
        });
        toast.success("Commission updated!");
      } else {
        await createCommission({
          commissionTypeId,
          astrologerId,
          commission: Number(commissionValue),
        });
        toast.success("Commission added!");
      }

      fetchCommission();
      setShowEditModal(false);
      setShowAddModal(false);
      setEditingCommission(null);
      setCommissionTypeId(0);
      setAstrologerId(0);
      setCommissionValue("");
    } catch (err) {
      toast.error("Failed to save commission");
    }
  };

 // edit handler
  const onEdit = (
    id: number,
    astrologerId: number,
    commissionTypeId: number,
    commission: number
  ) => {
    setEditingCommission({
      id,
      astrologerId,
      commissionTypeId,
      commission,
      astrologerName: "",
      commissionType: "",
      isActive: true,   // ya false, default value
      isDelete: false,  // ya true, default value
      createdBy: 1,
      modifiedBy: 1,
    });
    setCommissionTypeId(commissionTypeId);
    setAstrologerId(astrologerId);
    setCommissionValue(commission);
    setShowEditModal(true);
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      {/* Add Commission Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setCommissionTypeId(0);
            setAstrologerId(0);
            setCommissionValue("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
        <Plus size={16} /> Add Commission
        </button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">COMMISSION TYPE</TableHead>
            <TableHead className="text-center">ASTROLOGER</TableHead>
            <TableHead className="text-center">COMMISSION</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {commissionList.map((item) => (
            <TableRow key={item.id}>

              {/* Commission Type */}
              <TableCell className="text-center font-medium">{item.commissionType}</TableCell>

             {/* Astrologer Name */}
              <TableCell className="text-center">
                {item.astrologerName}
              </TableCell>

              {/* Commission % */}
              <TableCell className="text-center">
                {item.commission}%
              </TableCell>

              {/* Actions % */}
              <TableCell>
                <div className="flex justify-center items-center">
                  <button
                    onClick={() =>
                      onEdit(
                        item.id,
                        item.astrologerId,
                        item.commissionTypeId,
                        item.commission
                      )
                    }
                    className="flex items-center mr-3"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {commissionList.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Commission found
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isLast = pageNum === totalPages;
          const isCurrent = pageNum === currentPage;
          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1;

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}`}
              className={cn(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-primary text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                  {showEditModal ? "✏️ Edit Commission" : "➕ Add Commission"}
              </h2>

              <form onSubmit={onSubmit} className="grid gap-3">
                {/* Commission Type */}
                <div>
                  <label className="form-label">Commission Type</label>
                  <select
                    className="form-control border p-2 rounded w-full"
                    value={commissionTypeId}
                    onChange={(e) => setCommissionTypeId(Number(e.target.value))}
                    required
                  >
                    <option value="">-- Select Commission Type --</option>
                    {commissionTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Astrologer */}
                <div>
                  <label className="form-label">Astrologer</label>
                  <select
                    className="form-control border p-2 rounded w-full"
                    value={astrologerId}
                    onChange={(e) => setAstrologerId(Number(e.target.value))}
                    required
                  >
                    <option value="">-- Select Astrologer --</option>
                    {astrologers.map((astro) => (
                      <option key={astro.id} value={astro.id}>
                        {astro.name} - {astro.contactNo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commission (%) */}
                <div>
                  <label className="form-label">Commission (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(Number(e.target.value))}
                    className="form-control border p-2 rounded w-full"
                    placeholder="Commission"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowAddModal(false);
                      setEditingCommission(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {showEditModal ? "Save Changes" : "Add Commission"}
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}
    </div>
  );
}
