// src/components/customers/AddMoneyModal.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { avatarSrc } from "./utils";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass } from "@/components/GlassUI/GlassKit";
import { useToast } from "@/components/Toast/ToastProvider";
import { searchCustomers, addMoneyToWallet } from "@/app/customers/fetch";

export default function AddMoneyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [custQuery, setCustQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchCustomers(query);
      setSuggestions(results);
    } catch (err) {
      console.error("search error:", err);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => handleSearch(custQuery), 200);
    return () => clearTimeout(t);
  }, [custQuery, handleSearch, open]);

  const pickSuggestion = (c: any) => {
    setSelectedCustomer(c);
    setCustQuery(`${c.name || "Unnamed"} • ${c.contactNo || ""}`);
    setSuggestions([]);
  };

  async function onConfirmAddMoney(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (!selectedCustomer) {
      toast("warning", "Select Customer", "Please pick a customer.");
      return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      toast("warning", "Invalid Amount", "Amount must be positive.");
      return;
    }

    setIsSubmitting(true);
    const res = await addMoneyToWallet({ userId: selectedCustomer.id, amount: amt });
    setIsSubmitting(false);

    if (res?.status) {
      toast("success", "Added", res.message);
      onClose();
    } else {
      toast("error", "Error", res?.message || "Could not add money");
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Add Money to Wallet" maxWidth="max-w-xl">
      <form onSubmit={onConfirmAddMoney} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Customer (name / phone)</label>
          <div className="relative">
            <input
              type="text"
              value={custQuery}
              onChange={(e) => {
                setCustQuery(e.target.value);
                setSelectedCustomer(null);
              }}
              placeholder="Type name or phone..."
              className={glass.input + " w-full"}
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl bg-white dark:bg-slate-800 border border-white/20 shadow-md z-30">
                {suggestions.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => pickSuggestion(c)}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                      <Image src={avatarSrc(c.profile)} width={32} height={32} alt={`${c.name || "User"} avatar`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name || "Unnamed"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.contactNo || "No contact"} • id: {c.id}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Selected Customer</label>
          <div className="px-3 py-2 rounded-xl border bg-white/50 dark:bg-white/[0.02] border-white/20">
            {selectedCustomer ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={avatarSrc(selectedCustomer.profile)}
                    width={36}
                    height={36}
                    alt={`${selectedCustomer.name} avatar`}
                  />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedCustomer.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCustomer.contactNo} • id: {selectedCustomer.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">No customer selected</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Amount (INR)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className={glass.input + " w-full"}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className={glass.btnSecondary} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={glass.btnPrimary} disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add Money"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
