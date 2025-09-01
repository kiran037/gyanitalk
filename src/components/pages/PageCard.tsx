// app/pages/PageCard.tsx
"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";

type PageProps = {
  item: {
    id: number;
    title: string;
    description: string;
    isActive: number;
  };
};

export default function PageCard({ item }: PageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 550;

  // Strip HTML safely → plain text (for truncation only)
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const plainText = stripHtml(item.description);
  const truncatedText =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;

  return (
    <div className="intro-y col-span-12 md:col-span-6 box bg-white">
      <CardContent>
        {/* Title */}
        <div className="px-5 pt-5 text-slate-600 dark:text-slate-500">
          <h2 className="text-lg font-semibold">{item.title}</h2>
        </div>

        {/* Description + Read More */}
        <div className="p-5 text-slate-600 dark:text-slate-500">
          {isExpanded ? (
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
          ) : (
            <p>{truncatedText}</p>
          )}

          {plainText.length > maxLength && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-5 border-t border-slate-200/60 dark:border-darkmode-400 flex flex-col sm:flex-row items-center">
          {/* Left side (Edit button) */}
          <div className="w-full flex text-slate-500 text-xs sm:text-sm">
            <button className="flex items-center text-blue-600 hover:text-blue-800">
              <i className="w-4 h-4 mr-2">✏️</i>
              <span>Edit</span>
            </button>
          </div>

          {/* Right side (Toggle switch) */}
          <div className="form-check form-switch justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
            <label className="form-switch relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                //checked={item.isActive == 1}
                onChange={() => {}}
              />
              <div className="w-11 h-6 rounded-full border border-gray-400 bg-gray-300 peer-checked:bg-[#164e61] peer-checked:border-[#164e61] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              <span className="ml-3 text-sm text-gray-700">
                {item.isActive == 1 ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
