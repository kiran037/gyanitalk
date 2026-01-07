// src/components/Auth/OTPInput.tsx
"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  length?: number;
}

export default function OTPInput({
  value,
  onChange,
  error,
  length = 6,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newOTP = value.split("");
    newOTP[index] = digit;
    onChange(newOTP.join(""));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTP = value.split("");

      if (newOTP[index]) {
        // Clear current digit
        newOTP[index] = "";
        onChange(newOTP.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOTP[index - 1] = "";
        onChange(newOTP.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if it's all digits and matches the expected length
    if (/^\d+$/.test(pastedData) && pastedData.length === length) {
      onChange(pastedData);
      // Focus the last input
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[...Array(length)].map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border text-center text-lg sm:text-xl font-bold transition-all focus:outline-none focus:ring-2 ${
              error
                ? "border-red-400 dark:border-red-500 focus:ring-red-300"
                : "border-white/60 dark:border-white/10 focus:ring-[#FF6B35]/50"
            } bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl text-gray-900 dark:text-gray-100`}
          />
        ))}
      </div>

      {error && (
        <p className="flex items-center justify-center gap-1 text-xs font-medium text-red-500 animate-pulse">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Enter the {length}-digit OTP
      </p>
    </div>
  );
}