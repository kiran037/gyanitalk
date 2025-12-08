import { motion } from "framer-motion";
import { MessageSquare, Phone, ShoppingBag, Wallet, Star, Users, LifeBuoy, BookOpen } from "lucide-react";

interface UserOverviewCardsProps {
  userId: string;
  initialData: any;
}

export function UserOverviewCards({ userId, initialData }: UserOverviewCardsProps) {
  const cards = [
    {
      title: "Chats",
      value: initialData.engagement.chats.total,
      subtitle: `₹${initialData.engagement.chats.totalSpent} spent`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "blue",
    },
    {
      title: "Calls",
      value: initialData.engagement.calls.total,
      subtitle: `₹${initialData.engagement.calls.totalSpent} spent`,
      icon: <Phone className="w-5 h-5" />,
      color: "green",
    },
    {
      title: "Orders",
      value: initialData.engagement.orders.total,
      subtitle: `₹${initialData.engagement.orders.totalSpent} spent`,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "orange",
    },
    {
      title: "Wallet",
      value: `${initialData.wallet.totalTransactions}`,
      subtitle: `₹${initialData.wallet.totalAmount} total`,
      icon: <Wallet className="w-5 h-5" />,
      color: "purple",
    },
    {
      title: "Reviews",
      value: initialData.engagement.reviews.total,
      subtitle: `${initialData.engagement.reviews.averageRating.toFixed(1)} avg rating`,
      icon: <Star className="w-5 h-5" />,
      color: "yellow",
    },
    {
      title: "Following",
      value: initialData.engagement.following.astrologers,
      subtitle: "Astrologers",
      icon: <Users className="w-5 h-5" />,
      color: "pink",
    },
    {
      title: "Support",
      value: initialData.support.total,
      subtitle: "Tickets",
      icon: <LifeBuoy className="w-5 h-5" />,
      color: "indigo",
    },
    {
      title: "Content",
      value: initialData.content.horoscopeFeedback + initialData.content.storyViews,
      subtitle: "Engagements",
      icon: <BookOpen className="w-5 h-5" />,
      color: "teal",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{
            scale: 1.02,
            borderColor: "rgba(255, 107, 53, 0.5)",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-${card.color}-500/10 rounded-xl flex items-center justify-center`}>
              <div className={`text-${card.color}-600`}>{card.icon}</div>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {card.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {card.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  );
}