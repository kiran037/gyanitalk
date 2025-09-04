import {
  Home,
  User,
  IndianRupee,
  TicketPercent,
  Calendar,
  Users,
  Brain,
  FileText,
  Layers,
  BookOpen,
  BellRing,
  FileSpreadsheet,
  Contact,
  PlayCircle,
  Smile,
  Video,
  Image as ImageIcon,
  Rss,
  Edit,
  Settings,
  Star,
  CreditCard,
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
        icon: Users,
        items: [],
      },
      {
        title: "Transactions",
        icon: CreditCard,
        items: [
          {
            title: "Wallet Transactions",
            url: "/wallet",
            icon: IndianRupee,
          },
          {
            title: "Payment Transactions",
            url: "/payments",
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
            url: "/astrologers",
            icon: Users,
          },
          {
            title: "AI Astrologers",
            url: "/ai-astrologers",
            icon: Brain,
          },
        ],
      },
      {
        title: "Courses",
        icon: BookOpen,
        items: [
          {
            title: "Category",
            url: "/category",
            icon: Layers,
          },
          {
            title: "Courses",
            url: "/courses",
            icon: FileText,
          },
          {
            title: "Chapter",
            url: "/chapter",
            icon: FileSpreadsheet,
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
        title: "Page Management",
        url: "/pages",
        icon: FileText,
        items: [],
      },
      {
        title: "Contact Form",
        url: "/contact",
        icon: Contact,
        items: [],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "General Settings",
        icon: Settings,
        items: [
          {
            title: "Settings",
            url: "/settings",
            icon: Settings,
          },
          {
            title: "Customer Profile",
            url: "/customer-profile",
            icon: User,
          },
          {
            title: "HoroScope Signs",
            url: "/horoscope-signs",
            icon: Star,
          },
          {
            title: "Recharge Amounts",
            url: "/recharge-amounts",
            icon: IndianRupee,
          },
        ],
      },
      {
        title: "Extras",
        icon: Layers,
        items: [
          {
            title: "Blogs",
            url: "/blogs",
            icon: Edit,
          },
          {
            title: "Astroguru News",
            url: "/astrogurunews",
            icon: Rss,
          },
          {
            title: "Videos",
            url: "/videos",
            icon: Video,
          },
          {
            title: "Banner Management",
            url: "/banners",
            icon: ImageIcon,
          },
          {
            title: "Stories",
            url: "/stories",
            icon: PlayCircle,
          },
          {
            title: "Feedback",
            url: "/feedback",
            icon: Smile,
          },
        ],
      },
    ],
  },
];
