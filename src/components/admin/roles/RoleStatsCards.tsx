import { Shield, Users, Lock, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/adminUI/StatCard";

interface RoleStats {
  totalRoles: number;
  totalUsers: number;
  lockedRoles: number;
  editableRoles: number;
}

interface RoleStatsCardsProps {
  stats: RoleStats;
  loading?: boolean;
}

export default function RoleStatsCards({ stats, loading = false }: RoleStatsCardsProps) {
  const cards = [
    {
      title: "Total Roles",
      value: stats.totalRoles,
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Locked Roles",
      value: stats.lockedRoles,
      icon: <Lock className="w-5 h-5" />,
    },
    {
      title: "Editable Roles",
      value: stats.editableRoles,
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          loading={loading}
        />
      ))}
    </div>
  );
}