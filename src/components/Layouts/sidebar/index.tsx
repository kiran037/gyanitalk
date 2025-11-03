// /src/components/Layouts/sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ChevronRight, X, Menu } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";
import { cx } from "@/components/GlassUI/GlassKit";

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
          className={cx(
            "fixed left-4 top-4 z-50 rounded-xl p-2 shadow-lg md:hidden",
            "bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl",
            "border border-white/40 dark:border-white/10",
            "hover:bg-white/95 dark:hover:bg-white/[0.12] transition-colors"
          )}
        >
          <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        </button>
      )}

      <aside
        className={cx(
          "relative transition-all duration-300 ease-in-out",
          "bg-white/75 dark:bg-slate-900/40",
          "backdrop-blur-xl backdrop-saturate-150",
          "border-r border-white/40 dark:border-white/10",
          "shrink-0 flex-none",
          // Desktop: fill grid row (no page scroll). Mobile: drawer.
          isMobile ? "fixed inset-y-0 left-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.2)]" : "h-full",
          isMobile ? (isOpen ? "w-full max-w-[300px]" : "w-0") : "w-[250px]"
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
        {...(isMobile && !isOpen ? { inert: true } : {})}
      >
        {/* Column (header + scroll area) */}
        <div className="relative flex h-full flex-col">
          {/* Header row (logo / close) */}
          <div className="flex items-center justify-between p-6 pb-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className={cx(
                  "rounded-xl p-2 transition-all duration-200",
                  "text-slate-500 dark:text-slate-400",
                  "hover:bg-white/80 dark:hover:bg-white/[0.08]",
                  "hover:text-slate-800 dark:hover:text-white"
                )}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Scrollable nav area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 no-scrollbar">
            <div className="space-y-8">
              {NAV_DATA.map((section, sectionIndex) => (
                <div key={section.label}>
                  <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                                className={cx(
                                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                                  "hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-sm",
                                  activeChild &&
                                    "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-300 shadow-sm",
                                  hoveredItem === itemKey && "scale-[1.02] transform"
                                )}
                              >
                                <div
                                  className={cx(
                                    "rounded-lg p-1.5 transition-colors duration-200 backdrop-blur-sm",
                                    activeChild
                                      ? "bg-blue-500/15 dark:bg-blue-500/25"
                                      : "bg-slate-100/80 dark:bg-white/[0.06] group-hover:bg-white dark:group-hover:bg-white/[0.10]"
                                  )}
                                >
                                  <item.icon
                                    className={cx(
                                      "h-4 w-4 transition-colors duration-200",
                                      activeChild
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                                    )}
                                  />
                                </div>
                                <span
                                  className={cx(
                                    "flex-1 truncate transition-colors duration-200",
                                    activeChild
                                      ? "text-blue-700 dark:text-blue-300"
                                      : "text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white"
                                  )}
                                >
                                  {item.title}
                                </span>
                                <ChevronRight
                                  className={cx(
                                    "h-4 w-4 shrink-0 transition-all duration-200",
                                    expanded ? "rotate-90" : "rotate-0",
                                    activeChild
                                      ? "text-blue-500 dark:text-blue-400"
                                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
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
                                          className={cx(
                                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                            "hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-sm",
                                            isActive &&
                                              "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-300",
                                            hoveredItem === subItemKey && "scale-[1.02] transform"
                                          )}
                                          role="menuitem"
                                        >
                                          <div
                                            className={cx(
                                              "h-2 w-2 rounded-full transition-colors duration-200",
                                              isActive
                                                ? "bg-blue-500 dark:bg-blue-400"
                                                : "bg-slate-300 group-hover:bg-slate-400 dark:bg-slate-600 dark:group-hover:bg-slate-500"
                                            )}
                                          />
                                          <span
                                            className={cx(
                                              "truncate transition-colors duration-200",
                                              isActive
                                                ? "font-medium text-blue-700 dark:text-blue-300"
                                                : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 group-hover:dark:text-white"
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
                              className={cx(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                "hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-sm",
                                isActive &&
                                  "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-300",
                                hoveredItem === itemKey && "scale-[1.02] transform"
                              )}
                            >
                              <div
                                className={cx(
                                  "rounded-lg p-1.5 transition-colors duration-200 backdrop-blur-sm",
                                  isActive
                                    ? "bg-blue-500/15 dark:bg-blue-500/25"
                                    : "bg-slate-100/80 dark:bg-white/[0.06] group-hover:bg-white dark:group-hover:bg-white/[0.10]"
                                )}
                              >
                                <item.icon
                                  className={cx(
                                    "h-4 w-4 transition-colors duration-200",
                                    isActive
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                                  )}
                                />
                              </div>
                              <span
                                className={cx(
                                  "truncate transition-colors duration-200",
                                  isActive
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white"
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