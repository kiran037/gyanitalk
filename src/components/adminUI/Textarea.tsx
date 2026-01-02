

import { ReactNode } from "react";

interface TextareaProps {
  label?: string;
  name?: string;
  value: string | number | undefined | null; // Updated to reflect reality
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  error?: string;
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = "",
  error,
}: TextareaProps) {
  // 1. Create a safe value. If value is null/undefined, use ""
  const safeValue = value ?? "";

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          name={name}
          // 2. Use safeValue here to prevent the Console Error
          value={safeValue} 
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-200 dark:border-gray-700"
          } rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
        />
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
             {/* 3. Use safeValue here to prevent crash on .length lookup */}
            {String(safeValue).length}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}