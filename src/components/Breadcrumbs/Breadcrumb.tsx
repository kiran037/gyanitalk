"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_DATA } from "../Layouts/sidebar/data";

interface BreadcrumbProps {
  pageName: string;
}

const flattenNav = (navData: typeof NAV_DATA) => {
  const result: { title: string; url: string }[] = [];

  navData.forEach((section: any) => {
    section.items.forEach((item: any) => {
      if (item.url) {
        result.push({ title: item.title, url: item.url });
      }
      if (item.items?.length) {
        item.items.forEach((child: any) => {
          if (child.url) result.push({ title: child.title, url: child.url });
        });
      }
    });
  });

  return result;
};

const allPages = flattenNav(NAV_DATA);

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredPages = allPages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (url: string) => {
    setQuery("");
    setShowDropdown(false);
    router.push(url);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: Page Title */}
      <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
        {pageName}
      </h2>

      {/* Center: Search Bar */}
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Search pages..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {showDropdown && query && (
          <ul className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {filteredPages.length > 0 ? (
              filteredPages.map((p) => (
                <li
                  key={p.url}
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSelect(p.url)}
                >
                  {p.title}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No results
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Right side: Breadcrumb Trail */}
      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
