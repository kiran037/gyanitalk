
///Users/xeoren/Desktop/gyanitallk-admin/src/components/adminUI/Input.tsx
import { ReactNode } from "react";

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  // Loosened type to handle potential nulls from API data gracefully
  value: string | number | undefined | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean; 
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
}

export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  min,
  max,
  step,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          // FIX: Use nullish coalescing (??) to ensure value is never null/undefined
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          className={`w-full ${
            icon ? "pl-10" : "pl-3"
          } pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
    </div>
  );
}