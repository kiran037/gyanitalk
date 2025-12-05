"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { createContext, useContext, useEffect, useState } from "react";

type SidebarState = "expanded" | "collapsed";

type SidebarContextType = {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

const COLLAPSED_STATE_KEY = "sidebar-collapsed-state";

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsedState] = useState(true);
  const isMobile = useIsMobile();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_STATE_KEY);
      if (stored !== null) {
        setIsCollapsedState(stored === "true");
      }
    } catch (error) {
      console.error("Error loading sidebar collapsed state:", error);
    }
  }, []);

  // Set collapsed state and persist to localStorage
  const setIsCollapsed = (collapsed: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof collapsed === 'function' ? collapsed(isCollapsed) : collapsed;
    setIsCollapsedState(newValue);
    try {
      localStorage.setItem(COLLAPSED_STATE_KEY, String(newValue));
    } catch (error) {
      console.error("Error saving sidebar collapsed state:", error);
    }
  };

  // Handle mobile vs desktop behavior
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}