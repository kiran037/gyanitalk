"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RechargePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rechargeOptions, setRechargeOptions] = useState<
    { id: number; amount: number; cashback: number | null }[]
  >([]);

  // Recharge State
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRechargeOptions = async () => {
      try {
        const res = await fetch("/api/landing/recharge/options");
        const json = await res.json();
        if (json.success) {
          setRechargeOptions(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch recharge options", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRechargeOptions();
  }, []);

  const handleSelectPlan = (plan: { id: number; amount: number }) => {
    setRechargeAmount(plan.amount.toString());
    setSelectedPlanId(plan.id);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    setRechargeAmount(value);
    setSelectedPlanId(null);
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const amount = parseInt(rechargeAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setRechargeLoading(true);

    let cashback = 0;
    if (selectedPlanId) {
      const plan = rechargeOptions.find((p) => p.id === selectedPlanId);
      if (plan && plan.cashback) {
        cashback = plan.cashback;
      }
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load");
      setRechargeLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/landing/recharge/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cashback,
        }),
      });

      const data = await res.json();

      const rzp = new (window as any).Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Wallet Recharge",
        description: `Add ₹${amount} to wallet`,
        handler: () => {
          router.push("/profile/wallet");
          router.refresh();
        },
        theme: { color: "#FF6B35" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to start recharge");
    } finally {
      setRechargeLoading(false);
    }
  };

  const activePlan = rechargeOptions.find((p) => p.id === selectedPlanId);

  return (
    <div className="mx-auto min-h-screen w-full px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/profile/wallet"
            className="group rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 transition-transform group-hover:-translate-x-1 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Money
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <Lock className="h-3 w-3" />
              <span className="font-medium">Secure Payment Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Left Column: Input & Plans */}
          <div className="space-y-8">
            {/* Main Input Section */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111] md:p-8">
              <div className="relative z-10">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Enter Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-6 text-3xl font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rechargeAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-6 pl-12 pr-6 text-4xl font-bold text-gray-900 outline-none transition-all focus:border-[#FF6B35] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:border-[#FF6B35]"
                  />
                  {rechargeAmount && parseInt(rechargeAmount) > 0 && (
                    <div className="absolute right-6 rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/30">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Select Options */}
            {rechargeOptions.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Recommended Plans
                  </label>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-900/20">
                    GET CASHBACK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {rechargeOptions.map((opt) => {
                    const isSelected = selectedPlanId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectPlan(opt)}
                        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-6 transition-all active:scale-95 ${
                          isSelected
                            ? "border-[#FF6B35] bg-orange-50 shadow-lg shadow-orange-500/10 dark:bg-orange-900/10"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:bg-[#111] dark:hover:border-white/20"
                        }`}
                      >
                        {opt.cashback && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white dark:ring-[#111]">
                            +₹{opt.cashback} Extra
                          </div>
                        )}
                        <span
                          className={`text-1xl font-bold ${
                            isSelected
                              ? "text-[#FF6B35]"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          ₹{opt.amount}
                        </span>
                        {opt.cashback && (
                          <span className="mt-1 text-[10px] font-medium text-gray-400 group-hover:text-green-500">
                            Cashback Applied
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary & Trust */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-3xl border border-gray-100 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/5 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white/10">
                  <Wallet className="h-5 w-5 text-[#FF6B35]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Payment Summary
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Recharge Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{rechargeAmount || "0"}
                  </span>
                </div>

                {activePlan?.cashback && (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4" /> Cashback
                    </span>
                    <span className="font-bold">+₹{activePlan.cashback}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-white/10" />

                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">
                    Total Credit
                  </span>
                  <span className="text-[#FF6B35]">
                    ₹
                    {(
                      parseInt(rechargeAmount || "0") +
                      (activePlan?.cashback || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={
                    rechargeLoading ||
                    !rechargeAmount ||
                    parseInt(rechargeAmount) <= 0
                  }
                  className="w-full rounded-2xl bg-[#FF6B35] py-4 text-lg font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-[#ff5514] hover:shadow-orange-500/30 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:disabled:bg-gray-700"
                >
                  {rechargeLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Pay ₹${rechargeAmount || "0"}`
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Bank Grade Security (256-bit SSL)</span>
                </div>
                
                {/* Trust Logos */}
                <div className="flex flex-wrap justify-center gap-3 opacity-70 grayscale transition-all hover:grayscale-0">
                   {/* Razorpay */}
                   <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                    alt="Razorpay" 
                    className="h-5 object-contain"
                   />
                   <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                   {/* UPI */}
                   <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
                    alt="UPI" 
                    className="h-5 object-contain"
                   />
                   <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                   
                   <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                    alt="VISA" 
                    className="h-5 object-contain"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}