// import { url } from "inspector";
// import {
//   Home,
//   User,
//   IndianRupee,
//   TicketPercent,
//   Users,
//   Brain,
//   FileText,
//   Layers,
//   BookOpen,
//   BellRing,
//   Newspaper,
//   Contact,
//   PlayCircle,
//   Smile,
//   Video,
//   Rss,
//   CreditCard,
//   Folder,
//   PocketKnife,
//   X,
//   Bot,
//   Ticket,
//   List,
//   ShoppingBag,
//   PackageSearch,
//   Activity,
//   Inbox,
//   PhoneCall,
//   MessageSquare,
//   Clock,
//   BarChart,
//   Settings,
//   ShieldCheck,
//   Key,
//   Wallet,
// Receipt,
// ClipboardEdit,
// UserX,
// Award,
// LayoutGrid,
// LayoutDashboard,
// ShoppingCart,
// } from "lucide-react";

// export const NAV_DATA = [
//   {
//     label: "MAIN MENU",
//     items: [
//       {
//         title: "Dashboard",
//         url: "/admin/dashboard",
//         icon: Home,
//         items: [],
//       },
//       {
//         title: "Administration",
//         icon: ShieldCheck,
//         items: [
//           {
//             title: "Role Management",
//             url: "/admin/roles",
//             icon: Key,
//           },
//         ],
//       },
//       {
//         title: "Customers",
//         url: "/admin/customers",
//         icon: Users,
//         items: [],
//       },

//       {
//         title: "Requests Management",
//         icon: Inbox,
//         items: [
//           {
//             title: "Call Requests",
//             url: "/admin/requests/call-requests",
//             icon: PhoneCall,
//           },
//           {
//             title: "Chat Requests",
//             url: "/admin/requests/chat-requests",
//             icon: MessageSquare,
//           },
//           {
//             title: "Pending Requests",
//             url: "/admin/requests/pending",
//             icon: Clock,
//           },
//           {
//             title: "Analytics",
//             url: "/admin/requests/analytics",
//             icon: BarChart,
//           },
//           {
//             title: "Settings",
//             url: "/admin/requests/settings",
//             icon: Settings,
//           },
//         ],
//       },


//       {
//         title: "Transactions",
//         icon: CreditCard,
//         items: [
//           {
//             title: "Wallet Transactions",
//             url: "/admin/transaction/wallet",
//             icon: Wallet,
//           },
//           {
//             title: "Payment Transactions",
//             url: "/admin/transaction/payment",
//             icon: Receipt,
//           },
//           {
//             title: "Manual Transactions",
//             url: "/admin/transaction/manual",
//             icon: ClipboardEdit,
//           },
//         ],
//       },
//       {
//         title: "Coupons",
//         url: "/admin/coupons",
//         icon: TicketPercent,
//         items: [],
//       },
//       {
//         title: "Astrologers",
//         icon: User,
//         items: [
//           {
//             title: "Astrologers",
//             url: "/admin/astro",
//             icon: Users,
//           },
//           {
//             title: "AI Astrologers",
//             url: "/admin/astro/ai",
//             icon: Brain,
//           },
//           {
//             title: "Block Astrologer",
//             url: "/admin/astro/block-astro",
//             icon: UserX,
//           },
//           {
//             title: "Skills",
//             url: "/admin/astro/skills",
//             icon: Award,
//           },
//           {
//             title: "Categories",
//             url: "/admin/astro/categories",
//             icon: Folder,
//           },
//           {
//             title: "Groups",
//             url: "/admin/astro/groups",
//             icon: LayoutGrid,
//           },
//         ],
//       },
//       {
//         title: "Courses",
//         icon: BookOpen,
//         items: [
//           {
//             title: "Category",
//             url: "/admin/courses/categories",
//             icon: Layers,
//           },
//           {
//             title: "Courses",
//             url: "/admin/courses",
//             icon: FileText,
//           },
//         ],
//       },
//       {
//         title: "Astroshop",
//         icon: ShoppingBag,
//         items: [
//           {
//             title: "Dashboard",
//             url: "/admin/astroshop",
//             icon: LayoutDashboard,
//           },
//           {
//             title: "Products Categories",
//             url: "/admin/astroshop/categories",
//             icon: PackageSearch,
//           },
//           {
//             title: "Products",
//             url: "/admin/astroshop/products",
//             icon: PackageSearch,
//           },

//           {
//             title: "Orders",
//             url: "/admin/astroshop/orders",
//             icon: ShoppingCart,
//           },
//         ],
//       },
//       {
//         title: "Notifications",
//         url: "/admin/notifications",
//         icon: BellRing,
//         items: [],
//       },
//       {
//         title: "Support Management",
//         icon: Bot,
//         items: [
//           {
//             title: "Dashboard",
//             url: "/admin/supports/dashboard",
//             icon: Ticket,
//           },
//           {
//             title: "Tickets",
//             url: "/admin/supports/tickets",
//             icon: Ticket,
//           },
//           {
//             title: "FAQs",
//             url: "/admin/supports/faq",
//             icon: List,
//           },
//           {
//             title: "Contacts",
//             url: "/admin/supports/contact",
//             icon: Contact,
//           },
//         ],
//       },
//       {
//         title: "Earnings",
//         icon: IndianRupee,
//         items: [
//           {
//             title: "Dashboard",
//             url: "/admin/earnings",
//           },
//           {
//             title: "Astrologer Earnings",
//             url: "/admin/earnings/astrologer",
//           },
//           {
//             title: "Payment Methods",
//             url: "/admin/earnings/payment-methods",
//           },
//           { title: "Withdrawals", url: "/admin/earnings/withdrawals" },
//           { title: "Commissions", url: "/admin/earnings/commissions" },
//           { title: "Reports", url: "/admin/earnings/reports" },
//         ],
//       },
//       {
//         title: "Blogs",
//         url: "/admin/blogs",
//         icon: Newspaper,
//         items: [],
//       },
//     ],
//   },
//   {
//     label: "Settings",
//     items: [
//       {
//         title: "Page Management",
//         url: "/admin/pages",
//         icon: FileText,
//         items: [],
//       },
//       {
//         title: "User Analytics",
//         icon: Activity,
//         url: "/admin/user-activities",
//       },
//       {
//         title: "Extras",
//         icon: Layers,
//         items: [
//           {
//             title: "News",
//             url: "/admin/extras/news",
//             icon: Rss,
//           },
//           {
//             title: "Videos",
//             url: "/admin/extras/videos",
//             icon: Video,
//           },
//           {
//             title: "Stories",
//             url: "/admin/extras/stories",
//             icon: PlayCircle,
//           },
//           {
//             title: "Feedback",
//             url: "/admin/extras/feedback",
//             icon: Smile,
//           },
//         ],
//       },
//     ],
//   },
// ];


import {
  Home,
  ShieldCheck,
  Users,
  Inbox,
  CreditCard,
  TicketPercent,
  User,
  BookOpen,
  ShoppingBag,
  BellRing,
  Bot,
  IndianRupee,
  Newspaper,
  FileText,
  Activity,
  Layers,
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
        icon: ShieldCheck,
        items: [
          {
            title: "Role Management",
            url: "/admin/roles",
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
        title: "Requests Management",
        icon: Inbox,
        items: [
          {
            title: "Call Requests",
            url: "/admin/requests/call-requests",
          },
          {
            title: "Chat Requests",
            url: "/admin/requests/chat-requests",
          },
          {
            title: "Pending Requests",
            url: "/admin/requests/pending",
          },
          {
            title: "Analytics",
            url: "/admin/requests/analytics",
          },
          {
            title: "Settings",
            url: "/admin/requests/settings",
          },
        ],
      },

      {
        title: "Transactions",
        icon: CreditCard,
        items: [
          {
            title: "Wallet Transactions",
            url: "/admin/transaction/wallet",
          },
          {
            title: "Payment Transactions",
            url: "/admin/transaction/payment",
          },
          {
            title: "Manual Transactions",
            url: "/admin/transaction/manual",
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
          },
          {
            title: "AI Astrologers",
            url: "/admin/astro/ai",
          },
          {
            title: "Block Astrologer",
            url: "/admin/astro/block-astro",
          },
          {
            title: "Skills",
            url: "/admin/astro/skills",
          },
          {
            title: "Categories",
            url: "/admin/astro/categories",
          },
          {
            title: "Groups",
            url: "/admin/astro/groups",
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
          },
          {
            title: "Courses",
            url: "/admin/courses",
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
          },
          {
            title: "Products Categories",
            url: "/admin/astroshop/categories",
          },
          {
            title: "Products",
            url: "/admin/astroshop/products",
          },
          {
            title: "Orders",
            url: "/admin/astroshop/orders",
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
          },
          {
            title: "Tickets",
            url: "/admin/supports/tickets",
          },
          {
            title: "FAQs",
            url: "/admin/supports/faq",
          },
          {
            title: "Contacts",
            url: "/admin/supports/contact",
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
          {
            title: "Withdrawals",
            url: "/admin/earnings/withdrawals",
          },
          {
            title: "Commissions",
            url: "/admin/earnings/commissions",
          },
          {
            title: "Reports",
            url: "/admin/earnings/reports",
          },
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
        url: "/admin/user-activities",
        icon: Activity,
      },
      {
        title: "Extras",
        icon: Layers,
        items: [
          {
            title: "News",
            url: "/admin/extras/news",
          },
          {
            title: "Videos",
            url: "/admin/extras/videos",
          },
          {
            title: "Stories",
            url: "/admin/extras/stories",
          },
          {
            title: "Feedback",
            url: "/admin/extras/feedback",
          },
        ],
      },
    ],
  },
];

