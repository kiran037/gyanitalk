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
        body: JSON.stringify({ amount, cashback }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error creating order");
        setRechargeLoading(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Wallet Recharge",
        description: `Add ₹${amount} to wallet`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(
              "/api/landing/recharge/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  internal_payment_id: data.internalPaymentId,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.push("/profile/wallet");
              router.refresh();
            } else {
              alert("Payment verification failed. Check wallet history.");
            }
          } catch (e) {
            console.error(e);
          }
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
  const currentAmount = parseInt(rechargeAmount || "0");
  const cashbackPercentage = activePlan?.cashback || 0;
  const cashbackValue = (currentAmount * cashbackPercentage) / 100;
  const totalCredit = currentAmount + cashbackValue;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 pb-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile/wallet"
          className="p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Add Money
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-0.5">
            <Lock className="h-3 w-3" />
            <span className="font-medium">100% Secure Payment</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Input & Plans (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 block">
                Enter Amount
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-3xl font-bold text-gray-400">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rechargeAmount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-4 text-4xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-black/40 rounded-xl border-2 border-transparent focus:border-[#FF6B35] focus:bg-white dark:focus:bg-black outline-none transition-all placeholder-gray-300"
                />
                {rechargeAmount && parseInt(rechargeAmount) > 0 && (
                  <div className="absolute right-4 rounded-full bg-green-100 dark:bg-green-900/30 p-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Select Options */}
            {rechargeOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Recommended Packs
                  </label>
                  <span className="text-[10px] font-bold bg-orange-100 text-[#FF6B35] px-2 py-0.5 rounded-full dark:bg-orange-900/20">
                    EXTRA CASHBACK
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                  {rechargeOptions.map((opt) => {
                    const isSelected = selectedPlanId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectPlan(opt)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                          isSelected
                            ? "border-[#FF6B35] bg-orange-50 dark:bg-orange-900/10 shadow-md"
                            : "border-gray-100 bg-white dark:bg-[#1C1C1E] dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                        }`}
                      >
                        {opt.cashback && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                            +{opt.cashback}% Extra
                          </div>
                        )}
                        <span className={`text-lg font-bold ${isSelected ? "text-[#FF6B35]" : "text-gray-900 dark:text-white"}`}>
                          ₹{opt.amount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary (4 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 dark:bg-[#111] dark:border-white/5 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-[#FF6B35]">
                  <Wallet className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Summary</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Recharge Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{rechargeAmount || "0"}</span>
                </div>

                {activePlan?.cashback && (
                  <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/20 p-2 rounded-lg text-green-700 dark:text-green-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Cashback ({activePlan.cashback}%)
                    </span>
                    <span>+₹{cashbackValue.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between items-center text-base font-bold">
                  <span className="text-gray-900 dark:text-white">Total Credit</span>
                  <span className="text-[#FF6B35]">₹{totalCredit.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={rechargeLoading || !rechargeAmount || parseInt(rechargeAmount) <= 0}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rechargeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ₹${rechargeAmount || "0"}`}
              </button>

              {/* Trust Footer */}
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                    <ShieldCheck className="h-3 w-3" /> Secure Payment via
                </div>
                <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                    {/* Simple Text Placeholders if images fail, or SVG usage */}
                    <span className="font-bold text-xs">UPI</span>
                    <span className="font-bold text-xs">VISA</span>
                    <span className="font-bold text-xs">MasterCard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}