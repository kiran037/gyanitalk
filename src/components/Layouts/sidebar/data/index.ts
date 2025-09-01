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
  Contact,
  PlayCircle,
  Smile,
  Video,
  Airplay,
  Edit,
  Twitch,
  Rss,
  BellRing,
  BookOpen,
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
        title: "Blogs",
        url: "/blogs",
        icon: Edit,
        items: [],
      },
      {
        title: "Astroguru News",
        url: "/astrogurunews",
        icon: Rss,
        items: [],
      },
      {
        title: "Videos",
        url: "/videos",
        icon: Video,
        items: [],
      },
      {
        title: "Banner Management",
        url: "/tickets",
        icon: Twitch,
        items: [],
      },
      {
        title: "Stories",
        url: "/stories",
        icon: PlayCircle,
        items: [],
      },
           {
        title: "Notifications",
        url: "/notifications",
        icon: BellRing,
        items: [],
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: Smile,
        items: [],
      },
      {
        title: "Page Management",
        url: "/pages",
        icon: BookOpen,
        items: [],
      },
      {
        title: "Contact Form",
        url: "/contact",
        icon: Contact,
        items: [],
      },
      // {
      //   title: "Pages",
      //   icon: BadgeInfo,
      //   items: [
      //     {
      //       title: "Settings",
      //       url: "/pages/settings",
      //     },
      //   ],
      // },
    ],
  },
  // {
  //   label: "OTHERS",
  //   items: [
  //     {
  //       title: "UI Elements",
  //       icon: Square,
  //       items: [
  //         {
  //           title: "Alerts",
  //           url: "/ui-elements/alerts",
  //         },
  //         {
  //           title: "Buttons",
  //           url: "/ui-elements/buttons",
  //         },
  //       ],
  //     },
  //   ],
  // },
];
