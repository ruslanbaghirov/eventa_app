// components/profile/ProfileStats.tsx

import { Calendar, Star, Check, TrendingUp } from "lucide-react";
import { ProfileStats as Stats } from "@/app/types/profile";

interface ProfileStatsProps {
  stats: Stats;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: "Total RSVPs",
      value: stats.total_rsvps,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Upcoming Events",
      value: stats.upcoming_events,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Interested",
      value: stats.interested_count,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Going",
      value: stats.going_count,
      icon: Check,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <div key={item.label} className={`${item.bg} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-2">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
