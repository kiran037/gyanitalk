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
        url: "/admin/dashboard",
        icon: Home,
        items: [],
      },
      {
        title: "Administration",
        icon: Home,
        items: [
          {
            title: "Role Management",
            url: "/admin/roles",
            icon: IndianRupee,
          },
        ],
      },
      {
        title: "Customers",
        url: "/admin/customers",
        icon: Users,
        items: [],
      },
      {
        title: "Transactions",
        icon: CreditCard,
        items: [
          {
            title: "Wallet Transactions",
            url: "/admin/transaction/wallet",
            icon: IndianRupee,
          },
          {
            title: "Payment Transactions",
            url: "/admin/transaction/payment",
            icon: CreditCard,
          },
          {
            title: "Manual Transactions",
            url: "/admin/transaction/manual",
            icon: CreditCard,
          },
        ],
      },
      {
        title: "Coupons",
        url: "/admin/coupons",
        icon: TicketPercent,
        items: [],
      },
      {
        title: "Astrologers",
        icon: User,
        items: [
          {
            title: "Astrologers",
            url: "/admin/astro",
            icon: Users,
          },
          {
            title: "AI Astrologers",
            url: "/admin/astro/ai",
            icon: Brain,
          },
          {
            title: "Block Astrologer",
            url: "/admin/astro/block-astro",
            icon: X,
          },
          {
            title: "Skills",
            url: "/admin/astro/skills",
            icon: PocketKnife,
          },
          {
            title: "Categories",
            url: "/admin/astro/categories",
            icon: Folder,
          },
          {
            title: "Groups",
            url: "/admin/astro/groups",
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
            url: "/admin/courses/categories",
            icon: Layers,
          },
          {
            title: "Courses",
            url: "/admin/courses",
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
            url: "/admin/astroshop",
            icon: Folder,
          },
          {
            title: "Products Categories",
            url: "/admin/astroshop/categories",
            icon: PackageSearch,
          },
          {
            title: "Products",
            url: "/admin/astroshop/products",
            icon: PackageSearch,
          },

          {
            title: "Orders",
            url: "/admin/astroshop/orders",
            icon: IndianRupee,
          },
        ],
      },
      {
        title: "Notifications",
        url: "/admin/notifications",
        icon: BellRing,
        items: [],
      },
      {
        title: "Support Management",
        icon: Bot,
        items: [
          {
            title: "Dashboard",
            url: "/admin/supports/dashboard",
            icon: Ticket,
          },
          {
            title: "Tickets",
            url: "/admin/supports/tickets",
            icon: Ticket,
          },
          {
            title: "FAQs",
            url: "/admin/supports/faq",
            icon: List,
          },
          {
            title: "Contacts",
            url: "/admin/supports/contact",
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
            url: "/admin/earnings",
          },
          {
            title: "Astrologer Earnings",
            url: "/admin/earnings/astrologer",
          },
          {
            title: "Payment Methods",
            url: "/admin/earnings/payment-methods",
          },
          { title: "Withdrawals", url: "/admin/earnings/withdrawals" },
          { title: "Commissions", url: "/admin/earnings/commissions" },
          { title: "Reports", url: "/admin/earnings/reports" },
        ],
      },
      {
        title: "Blogs",
        url: "/admin/blogs",
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
        url: "/admin/pages",
        icon: FileText,
        items: [],
      },
      {
        title: "User Analytics",
        icon: Activity,
        url: "/admin/user-activities",
      },
      {
        title: "Extras",
        icon: Layers,
        items: [
          {
            title: "News",
            url: "/admin/extras/news",
            icon: Rss,
          },
          {
            title: "Videos",
            url: "/admin/extras/videos",
            icon: Video,
          },
          {
            title: "Stories",
            url: "/admin/extras/stories",
            icon: PlayCircle,
          },
          {
            title: "Feedback",
            url: "/admin/extras/feedback",
            icon: Smile,
          },
        ],
      },
    ],
  },
];
