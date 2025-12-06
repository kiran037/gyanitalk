
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { NAV_DATA } from "./data";
import { ChevronRight, X, Search, Menu, Pin, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

const PINNED_ITEMS_KEY = "sidebar-pinned-items";
const RECENT_ITEMS_KEY = "sidebar-recent-items";
const MAX_RECENT_ITEMS = 5;

interface RecentItem {
  title: string;
  url: string;
  timestamp: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar, isCollapsed, setIsCollapsed } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Load pinned and recent items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_ITEMS_KEY);
      if (stored) setPinnedItems(JSON.parse(stored));

      const storedRecent = localStorage.getItem(RECENT_ITEMS_KEY);
      if (storedRecent) setRecentItems(JSON.parse(storedRecent));
    } catch (error) {
      console.error("Error loading sidebar data:", error);
    }
  }, []);

  // Save recent items when pathname changes
  useEffect(() => {
    if (!pathname) return;

    const title = getPageTitle(pathname);
    if (!title) return;

    setRecentItems(prev => {
      const filtered = prev.filter(item => item.url !== pathname);
      const updated = [
        { title, url: pathname, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT_ITEMS);

      try {
        localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent items:", error);
      }

      return updated;
    });
  }, [pathname]);

  const buildUrlFromTitle = (title: string) =>
    "/" + title.toLowerCase().split(" ").join("-");


  // Helper to get page title from pathname
  const getPageTitle = (url: string): string | null => {
    for (const section of NAV_DATA) {
      for (const item of section.items) {
        // 1) Check top-level item (including those without explicit `url`)
        const itemUrl =
          "url" in item ? (item.url as string) : buildUrlFromTitle(item.title);

        if (itemUrl === url) {
          return item.title;
        }

        // 2) Check children (sub items)
        if (item.items) {
          const subItem = item.items.find((sub) => sub.url === url);
          if (subItem) return subItem.title;
        }
      }
    }
    return null;
  };


  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const togglePin = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setPinnedItems(prev => {
      const updated = prev.includes(url)
        ? prev.filter(item => item !== url)
        : [...prev, url];

      try {
        localStorage.setItem(PINNED_ITEMS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving pinned items:", error);
      }

      return updated;
    });
  };

  // Check scroll position for indicators
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollTop(scrollTop > 20);
    setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 20);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Auto-expand active parent items
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
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close sidebar on mobile
      if (e.key === "Escape" && isMobile && isOpen) {
        setIsOpen(false);
      }

      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Cmd/Ctrl + B to toggle sidebar on desktop
      if ((e.metaKey || e.ctrlKey) && e.key === "b" && !isMobile) {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isOpen, setIsOpen, setIsCollapsed]);

  // Touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isOpen) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = Math.abs(touchY - touchStartY.current);

    // If swiping left and not scrolling vertically much
    if (deltaX < -50 && deltaY < 30) {
      setIsOpen(false);
    }
  };

  // Scroll to top/bottom
  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  // Filter navigation based on search
  const filteredNavData = searchQuery
    ? NAV_DATA.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const matchesParent = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChild = item.items?.some((sub) =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesParent || matchesChild;
      }),
    })).filter((section) => section.items.length > 0)
    : NAV_DATA;

  const shouldExpand = isMobile ? isOpen : (isHovered || !isCollapsed);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const transitionClass = prefersReducedMotion ? '' : 'transition-all duration-300 ease-in-out';

    if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm ${transitionClass}`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`relative ${transitionClass} bg-white/60 dark:bg-white/5 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 shrink-0 flex-none ${isMobile
          ? `fixed inset-y-0 left-0 z-50 shadow-2xl ${isOpen ? 'w-full max-w-[min(85vw,320px)] translate-x-0' : 'w-0 -translate-x-full'}`
          : shouldExpand ? 'w-[280px]' : 'w-[72px]'
          }`}
        style={{ height: '100dvh' }}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
        role="navigation"
      >
        <div className="relative flex h-full flex-col">
          {/* Header */}
          <div className={`flex items-center shrink-0 ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-200/60 dark:border-gray-700/60 ${shouldExpand ? 'justify-between' : 'justify-center'}`}>
            {shouldExpand ? (
              <>
                <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Menu
                </span>
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-600/30 rounded">
                      ⌘B
                    </kbd>
                  )}
                  {isMobile ? (
                    <button
                      onClick={toggleSidebar}
                      className="rounded-xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white active:scale-95"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="rounded-xl p-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white"
                      aria-label="Toggle collapse"
                      title="Toggle sidebar (⌘B)"
                    >
                      <ChevronRight className={`h-5 w-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsCollapsed(false)}
                className="rounded-xl p-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white"
                aria-label="Expand sidebar"
                title="Expand sidebar (⌘B)"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Bar - Sticky */}
          {shouldExpand && (
            <div className={`shrink-0 ${isMobile ? 'p-3' : 'p-4'} bg-white/40 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/30 dark:border-gray-700/30`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-4 ${isMobile ? 'py-2.5' : 'py-2.5'} bg-white/50 dark:bg-gray-800/50 border ${isSearchFocused
                    ? 'border-[#FF6B35]/50 ring-2 ring-[#FF6B35]/20'
                    : 'border-gray-200/60 dark:border-gray-600/30'
                    } rounded-xl focus:outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 transition-all`}
                  aria-label="Search navigation"
                />
              </div>
            </div>
          )}

          {/* Scroll Top Indicator */}
          {shouldExpand && showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute top-[120px] right-2 z-20 p-1.5 bg-gradient-to-b from-white/90 to-transparent dark:from-gray-900/90 backdrop-blur-sm rounded-full shadow-lg transition-opacity hover:opacity-80"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Scrollable nav area */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto overscroll-contain ${isMobile ? 'px-3' : 'px-4'
              } pb-20 no-scrollbar`}   // ⬅️ was pb-6
            style={{ scrollBehavior: prefersReducedMotion ? 'auto' : 'smooth' }}
          >

            <div className="space-y-6 pt-2">
              {/* Pinned Items Section */}
              {shouldExpand && pinnedItems.length > 0 && !searchQuery && (
                <div>
                  <h2 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </h2>
                  <nav role="navigation" aria-label="Pinned items">
                    <ul className="space-y-1">
                      {pinnedItems.map(url => {
                        const title = getPageTitle(url);
                        if (!title) return null;
                        const isActive = pathname === url;

                        return (
                          <li key={url} className="group/item">
                            <div className="relative">
                              <Link
                                href={url}
                                onClick={() => isMobile && toggleSidebar()}
                                className={`flex w-full items-center gap-3 rounded-xl pl-3 pr-8 ${isMobile ? 'py-3' : 'py-2.5'} text-sm font-medium transition-all duration-200 ${isActive
                                  ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                  : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                <Pin className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#FF6B35]' : 'text-gray-400'}`} />
                                <span className="flex-1 truncate">{title}</span>
                              </Link>

                              {/* Unpin button on hover */}
                              <button
                                onClick={(e) => togglePin(url, e)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200 opacity-100 text-[#FF6B35] hover:bg-[#FF6B35]/10"
                                aria-label="Unpin item"
                                title="Unpin"
                              >
                                <Pin className="h-3 w-3 fill-current" />
                              </button>
                            </div>
                          </li>
                        );
                      })}

                    </ul>
                  </nav>
                </div>
              )}

              {/* Recent Items Section */}
              {shouldExpand && recentItems.length > 0 && !searchQuery && (
                <div>
                  <h2 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recent
                  </h2>
                  <nav role="navigation" aria-label="Recent items">
                    <ul className="space-y-1">
                      {recentItems.slice(0, 3).map(item => {
                        const isActive = pathname === item.url;

                        return (
                          <li key={item.url}>
                            <Link
                              href={item.url}
                              onClick={() => isMobile && toggleSidebar()}
                              className={`group flex items-center gap-3 rounded-xl px-3 ${isMobile ? 'py-3' : 'py-2.5'} text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                              <Clock className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#FF6B35]' : 'text-gray-400'}`} />
                              <span className="flex-1 truncate">{item.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Main Navigation */}
              {filteredNavData.map((section) => (
                <div key={section.label}>
                  {shouldExpand && (
                    <h2 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {section.label}
                    </h2>
                  )}

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const hasChildren = (item.items?.length ?? 0) > 0;
                        const activeChild = item.items?.some(({ url }) => url === pathname);

                        if (hasChildren) {
                          const expanded = expandedItems.includes(item.title);
                          const childCount = item.items?.length ?? 0;

                          return (
                            <li key={item.title} className="space-y-1">
                              <button
                                onClick={() => toggleExpanded(item.title)}
                                className={`group flex w-full items-center gap-3 rounded-xl px-3 ${isMobile ? 'py-3' : 'py-2.5'} text-left text-sm font-medium transition-all duration-200 ${activeChild
                                  ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                  : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                  } ${!shouldExpand ? 'justify-center' : ''}`}
                                title={!shouldExpand ? `${item.title} (${childCount} items)` : undefined}
                              >
                                <div
                                  className={`rounded-lg p-1.5 transition-all duration-200 ${activeChild
                                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-lg'
                                    : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-700/80'
                                    } relative`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 transition-colors duration-200 ${activeChild
                                      ? 'text-white'
                                      : 'text-gray-500 group-hover:text-[#FF6B35] dark:text-gray-400 dark:group-hover:text-[#FF8C61]'
                                      }`}
                                  />

                                </div>
                                {shouldExpand && (
                                  <>
                                    <span className="flex-1 truncate">{item.title}</span>
                                    <ChevronRight
                                      className={`h-4 w-4 shrink-0 transition-all duration-200 ${expanded ? 'rotate-90' : 'rotate-0'
                                        } ${activeChild
                                          ? 'text-[#FF6B35] dark:text-[#FF8C61]'
                                          : 'text-gray-400 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF8C61]'
                                        }`}
                                      aria-hidden="true"
                                    />
                                  </>
                                )}
                              </button>

                              {expanded && shouldExpand && (
                                <ul className="ml-6 space-y-1 overflow-hidden" role="menu">
                                  {item.items!.map((sub) => {
                                    const href = sub.url;
                                    const isActive = pathname === href;
                                    const isPinned = pinnedItems.includes(href);

                                    return (
                                      <li key={sub.title} role="none" className="group/item">
                                        <div className="relative">
                                          <Link
                                            href={href}
                                            onClick={() => isMobile && toggleSidebar()}
                                            className={`flex items-center gap-3 rounded-xl pl-3 pr-8 ${isMobile ? 'py-3' : 'py-2'} text-sm transition-all duration-200 ${isActive
                                              ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm font-medium'
                                              : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                                              }`}
                                            role="menuitem"
                                          >
                                            <div
                                              className={`h-2 w-2 rounded-full transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] shadow-lg shadow-[#FF6B35]/50'
                                                : 'bg-gray-300 group-hover/item:bg-[#FF6B35] dark:bg-gray-600 dark:group-hover/item:bg-[#FF8C61]'
                                                }`}
                                            />
                                            <span className="truncate flex-1">{sub.title}</span>
                                          </Link>
                                          <button
                                            onClick={(e) => togglePin(href, e)}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200 ${isPinned
                                              ? 'opacity-100 text-[#FF6B35] hover:bg-[#FF6B35]/10'
                                              : 'opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-[#FF6B35] hover:bg-white/60 dark:hover:bg-gray-800/60'
                                              }`}
                                            aria-label={isPinned ? "Unpin item" : "Pin item"}
                                            title={isPinned ? "Unpin" : "Pin"}
                                          >
                                            <Pin className={`h-3 w-3 ${isPinned ? 'fill-current' : ''}`} />
                                          </button>
                                        </div>
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
                        const isPinned = pinnedItems.includes(href);

                        return (
                          <li key={item.title} className="group/item">
                            <div className="relative">
                              <Link
                                href={href}
                                onClick={() => isMobile && toggleSidebar()}
                                className={`flex w-full items-center gap-3 rounded-xl ${shouldExpand ? 'pl-3 pr-8' : 'px-3'
                                  } ${isMobile ? 'py-3' : 'py-2.5'} text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                    : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                  } ${!shouldExpand ? 'justify-center' : ''}`}
                                title={!shouldExpand ? item.title : undefined}
                              >
                                <div
                                  className={`rounded-lg p-1.5 transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-lg'
                                    : 'bg-white/50 dark:bg-gray-800/50 group-hover/item:bg-white dark:group-hover/item:bg-gray-700/80'
                                    }`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 transition-colors duration-200 ${isActive
                                      ? 'text-white'
                                      : 'text-gray-500 group-hover/item:text-[#FF6B35] dark:text-gray-400 dark:group-hover/item:text-[#FF8C61]'
                                      }`}
                                  />
                                </div>
                                {shouldExpand && <span className="truncate flex-1">{item.title}</span>}
                              </Link>
                              {shouldExpand && (
                                <button
                                  onClick={(e) => togglePin(href, e)}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200 ${isPinned
                                    ? 'opacity-100 text-[#FF6B35] hover:bg-[#FF6B35]/10'
                                    : 'opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-[#FF6B35] hover:bg-white/60 dark:hover:bg-gray-800/60'
                                    }`}
                                  aria-label={isPinned ? "Unpin item" : "Pin item"}
                                  title={isPinned ? "Unpin" : "Pin"}
                                >
                                  <Pin className={`h-3 w-3 ${isPinned ? 'fill-current' : ''}`} />
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              ))}

              {/* No results message */}
              {searchQuery && filteredNavData.length === 0 && (
                <div className="text-center py-8 px-4">
                  <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scroll Bottom Indicator */}
          {shouldExpand && showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-2 z-20 p-1.5 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-900/90 backdrop-blur-sm rounded-full shadow-lg transition-opacity hover:opacity-80"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          <style jsx global>{`
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            
            @media (max-width: 640px) {
              .no-scrollbar {
                -webkit-overflow-scrolling: touch;
              }
            }
          `}</style>
        </div>
      </aside>
    </>
  );
}