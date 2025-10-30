// /src/components/Layouts/sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ChevronRight, X, Menu } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  useEffect(() => {
    NAV_DATA.forEach((section) => {
      section.items.forEach((item) => {
        item.items?.forEach((sub) => {
          if (sub.url === pathname && !expandedItems.includes(item.title)) {
            setExpandedItems((p) => [...p, item.title]);
          }
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu button */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2 shadow-lg dark:bg-gray-800 md:hidden"
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      <aside
        className={cn(
          "relative transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/80",
          "border-r border-gray-200/60 dark:border-gray-700/50",
          "backdrop-blur-xl",
          "shrink-0 flex-none",
          // Desktop: fill grid row (no page scroll). Mobile: drawer.
          isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "h-full",
          isMobile ? (isOpen ? "w-full max-w-[300px]" : "w-0") : "w-[250px]"
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
        {...(isMobile && !isOpen ? { inert: true } : {})}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03]" />

        {/* Column (header + scroll area) */}
        <div className="relative flex h-full flex-col">
          {/* Header row (logo / close) */}
          <div className="flex items-center justify-between p-6 pb-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="rounded-xl p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Scrollable nav area — only scrolls when hovered; no scroll chaining; hidden scrollbar */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 no-scrollbar">
            <div className="space-y-8">
              {NAV_DATA.map((section, sectionIndex) => (
                <div key={section.label}>
                  <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {section.label}
                  </h2>

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const hasChildren = (item.items?.length ?? 0) > 0;
                        const activeChild = item.items?.some(({ url }) => url === pathname);
                        const itemKey = `${sectionIndex}-${itemIndex}`;

                        if (hasChildren) {
                          const expanded = expandedItems.includes(item.title);
                          return (
                            <li key={item.title} className="space-y-1">
                              <button
                                onClick={() => toggleExpanded(item.title)}
                                onMouseEnter={() => setHoveredItem(itemKey)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={cn(
                                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                                  "hover:bg-white/80 hover:shadow-sm dark:hover:bg-gray-800/60",
                                  activeChild &&
                                    "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300",
                                  hoveredItem === itemKey && "scale-[1.02] transform"
                                )}
                              >
                                <div
                                  className={cn(
                                    "rounded-lg p-1.5 transition-colors duration-200",
                                    activeChild
                                      ? "bg-blue-100 dark:bg-blue-800/50"
                                      : "bg-gray-100 group-hover:bg-white dark:bg-gray-700 dark:group-hover:bg-gray-600"
                                  )}
                                >
                                  <item.icon
                                    className={cn(
                                      "h-4 w-4 transition-colors duration-200",
                                      activeChild
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
                                    )}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "flex-1 truncate transition-colors duration-200",
                                    activeChild
                                      ? "text-blue-700 dark:text-blue-300"
                                      : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                                  )}
                                >
                                  {item.title}
                                </span>
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-all duration-200",
                                    expanded ? "rotate-90" : "rotate-0",
                                    activeChild
                                      ? "text-blue-500 dark:text-blue-400"
                                      : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                  )}
                                  aria-hidden="true"
                                />
                              </button>

                              {expanded && (
                                <ul className="ml-6 space-y-1 overflow-hidden" role="menu">
                                  {item.items!.map((sub, subIndex) => {
                                    const href = sub.url;
                                    const isActive = pathname === href;
                                    const subItemKey = `${itemKey}-${subIndex}`;
                                    return (
                                      <li key={sub.title} role="none">
                                        <Link
                                          href={href}
                                          onClick={() => isMobile && toggleSidebar()}
                                          onMouseEnter={() => setHoveredItem(subItemKey)}
                                          onMouseLeave={() => setHoveredItem(null)}
                                          className={cn(
                                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                            "hover:bg-white/80 hover:shadow-sm dark:hover:bg-gray-800/60",
                                            isActive &&
                                              "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300",
                                            hoveredItem === subItemKey && "scale-[1.02] transform"
                                          )}
                                          role="menuitem"
                                        >
                                          <div
                                            className={cn(
                                              "h-2 w-2 rounded-full transition-colors duration-200",
                                              isActive
                                                ? "bg-blue-500 dark:bg-blue-400"
                                                : "bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-600 dark:group-hover:bg-gray-500"
                                            )}
                                          />
                                          <span
                                            className={cn(
                                              "truncate transition-colors duration-200",
                                              isActive
                                                ? "font-medium text-blue-700 dark:text-blue-300"
                                                : "text-gray-600 group-hover:text-gray-900 dark:text-gray-400 group-hover:dark:text-white"
                                            )}
                                          >
                                            {sub.title}
                                          </span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        }

                        // Leaf item
                        const href =
                          "url" in item
                            ? (item.url as string)
                            : "/" + item.title.toLowerCase().split(" ").join("-");

                        const isActive = pathname === href;

                        return (
                          <li key={item.title}>
                            <Link
                              href={href}
                              onClick={() => isMobile && toggleSidebar()}
                              onMouseEnter={() => setHoveredItem(itemKey)}
                              onMouseLeave={() => setHoveredItem(null)}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                "hover:bg-white/80 hover:shadow-sm dark:hover:bg-gray-800/60",
                                isActive &&
                                  "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300",
                                hoveredItem === itemKey && "scale-[1.02] transform"
                              )}
                            >
                              <div
                                className={cn(
                                  "rounded-lg p-1.5 transition-colors duration-200",
                                  isActive
                                    ? "bg-blue-100 dark:bg-blue-800/50"
                                    : "bg-gray-100 group-hover:bg-white dark:bg-gray-700 dark:group-hover:bg-gray-600"
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-4 w-4 transition-colors duration-200",
                                    isActive
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
                                  )}
                                />
                              </div>
                              <span
                                className={cn(
                                  "truncate transition-colors duration-200",
                                  isActive
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                                )}
                              >
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* hide scrollbar helper */}
          <style jsx global>{`
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </aside>
    </>
  );
}
