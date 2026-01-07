// src/components/UI/PhoneInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, ChevronDown } from "lucide-react";

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  error?: string;
  disabled?: boolean;
}

// Popular country codes
const countryCodes = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
];

export default function PhoneInput({
  value,
  countryCode,
  onChange,
  error,
  disabled,
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected country
  const selectedCountry = countryCodes.find((c) => c.code === countryCode) || countryCodes[0];

  // Filter countries based on search
  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery) ||
      country.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value.replace(/\D/g, ""); // Only digits
    onChange(phoneValue, countryCode);
  };

  const handleCountrySelect = (code: string) => {
    onChange(value, code);
    setShowDropdown(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors z-10">
          <Phone className="h-5 w-5" />
        </div>

        {/* Country Code Selector */}
        <button
          type="button"
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          disabled={disabled}
          className="absolute left-10 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {selectedCountry.code}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </button>

        {/* Phone Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder="9876543210"
          disabled={disabled}
          className={`w-full rounded-xl border bg-white pl-32 pr-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all dark:bg-gray-800 dark:text-white ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-white/60 dark:border-white/10 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-pulse">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      {/* Country Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10"
        >
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
            />
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {filteredCountries.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No countries found
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredCountries.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50/50 dark:hover:bg-gray-800 ${
                        country.code === countryCode
                          ? "bg-orange-50 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {country.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {country.code}
                        </p>
                      </div>
                      {country.code === countryCode && (
                        <div className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}