import { url } from "inspector";
import {
  Home,
  User,
  IndianRupee,
  TicketPercent,
  Users,
  Brain,
  FileText,
  Layers,
  BookOpen,
  BellRing,
  Newspaper,
  Contact,
  PlayCircle,
  Smile,
  Video,
  Rss,
  CreditCard,
  Folder,
  PocketKnife,
  X,
  Bot,
  Ticket,
  List,
  ShoppingBag,
  PackageSearch,
  Activity,
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        items: [],
      },
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        items: [],
      },
      {
        title: "Transactions",
        icon: CreditCard,
        items: [
          {
            title: "Wallet Transactions",
            url: "/transaction/wallet",
            icon: IndianRupee,
          },
          {
            title: "Payment Transactions",
            url: "/transaction/payment",
            icon: CreditCard,
          },
          {
            title: "Manual Transactions",
            url: "/transaction/manual",
            icon: CreditCard,
          },
        ],
      },
      {
        title: "Coupons",
        url: "/coupons",
        icon: TicketPercent,
        items: [],
      },
      {
        title: "Astrologers",
        icon: User,
        items: [
          {
            title: "Astrologers",
            url: "/astro",
            icon: Users,
          },
          {
            title: "AI Astrologers",
            url: "/astro/ai",
            icon: Brain,
          },
          {
            title: "Block Astrologer",
            url: "/astro/block-astro",
            icon: X,
          },
          {
            title: "Skills",
            url: "/astro/skills",
            icon: PocketKnife,
          },
          {
            title: "Categories",
            url: "/astro/categories",
            icon: Folder,
          },
          {
            title: "Groups",
            url: "/astro/groups",
            icon: Folder,
          },
        ],
      },
      {
        title: "Courses",
        icon: BookOpen,
        items: [
          {
            title: "Category",
            url: "/courses/categories",
            icon: Layers,
          },
          {
            title: "Courses",
            url: "/courses",
            icon: FileText,
          },
        ],
      },
      {
        title: "Astroshop",
        icon: ShoppingBag,
        items: [
          {
            title: "Dashboard",
            url: "/astroshop",
            icon: Folder,
          },
          {
            title: "Products Categories",
            url: "/astroshop/categories",
            icon: PackageSearch,
          },
          {
            title: "Products",
            url: "/astroshop/products",
            icon: PackageSearch,
          },

          {
            title: "Orders",
            url: "/astroshop/orders",
            icon: IndianRupee,
          },
        ],
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: BellRing,
        items: [],
      },
      {
        title: "Support Management",
        icon: Bot,
        items: [
          {
            title: "Dashboard",
            url: "/supports/dashboard",
            icon: Ticket,
          },
          {
            title: "Tickets",
            url: "/supports/tickets",
            icon: Ticket,
          },
          {
            title: "FAQs",
            url: "/supports/faq",
            icon: List,
          },
          {
            title: "Contacts",
            url: "/supports/contact",
            icon: Contact,
          },
        ],
      },
      {
        title: "Earnings",
        icon: IndianRupee,
        items: [
          {
            title: "Dashboard",
            url: "/earnings",
          },
          {
            title: "Astrologer Earnings",
            url: "/earnings/astrologer",
          },
          {
            title: "Payment Methods",
            url: "/earnings/payment-methods",
          },
          { title: "Withdrawals", url: "/earnings/withdrawals" },
          { title: "Commissions", url: "/earnings/commissions" },
          { title: "Reports", url: "/earnings/reports" },
        ],
      },
      {
        title: "Blogs",
        url: "/blogs",
        icon: Newspaper,
        items: [],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Page Management",
        url: "/pages",
        icon: FileText,
        items: [],
      },
      {
        title: "User Analytics",
        icon: Activity,
        url: "/user-activities",
      },
      {
        title: "Extras",
        icon: Layers,
        items: [
          {
            title: "News",
            url: "/extras/news",
            icon: Rss,
          },
          {
            title: "Videos",
            url: "/extras/videos",
            icon: Video,
          },
          {
            title: "Stories",
            url: "/extras/stories",
            icon: PlayCircle,
          },
          {
            title: "Feedback",
            url: "/extras/feedback",
            icon: Smile,
          },
        ],
      },
    ],
  },
];
