import {
  Home,
  User,
  IndianRupee,
  Calendar,
  BadgeInfo,
  ListChecks,
  Settings,
  FileText,
  Square,
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        items: [],
      },
      {
        title: "Customers",
        url: "/customers",
        icon: User,
        items: [],
      },

      {
        title: "Astrologers",
        icon: User,
        items: [
          {
            title: "Astrologers",
            url: "/astrologers",
          },
          {
            title: "AI Astrologers",
            url: "/ai-astrologers",
          },
        ],
      },
      {
        title: "Transactions",
        icon: IndianRupee,
        items: [
          {
            title: "Wallet Transactions",
            url: "/wallet",
          },
          {
            title: "Payment Transactions",
            url: "/payments",
          },
        ],
      },

      {
        title: "Coupons",
        url: "/coupons",
        icon: Calendar,
        items: [],
      },
      {
        title: "Courses",
        icon: FileText,
        items: [

          {
            title: "Category",
            url: "/category",
          },
          {
            title: "Courses",
            url: "/courses",
          },
          {
            title: "Chapter",
            url: "/chapter",
          },
        ],
      },
      {
        title: "Pages",
        icon: BadgeInfo,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "UI Elements",
        icon: Square,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
    ],
  },
];
