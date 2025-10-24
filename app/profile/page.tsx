// app/profile/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileStats from "@/app/components/profile/ProfileStats";
import Link from "next/link";
import { Calendar, Settings, BarChart3 } from "lucide-react";
import { UserProfile, ProfileStats as Stats } from "@/app/types/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError);
    redirect("/login");
  }

  // Fetch RSVP stats
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*, events!inner(*)")
    .eq("user_id", user.id)
    .eq("status", "active");

  const now = new Date().toISOString();
  const stats: Stats = {
    total_rsvps: rsvps?.length || 0,
    upcoming_events:
      rsvps?.filter((r: any) => r.events.date >= now.split("T")[0]).length || 0,
    past_events:
      rsvps?.filter((r: any) => r.events.date < now.split("T")[0]).length || 0,
    interested_count:
      rsvps?.filter((r: any) => r.rsvp_type === "interested").length || 0,
    going_count: rsvps?.filter((r: any) => r.rsvp_type === "going").length || 0,
  };

  const userProfile: UserProfile = {
    ...profile,
    favorite_categories: profile.favorite_categories || [],
    notification_preferences: profile.notification_preferences || {
      event_updates: true,
      event_reminders: true,
      event_cancellations: true,
      weekly_digest: false,
      security_alerts: true,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account and preferences
              </p>
            </div>
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <ProfileHeader profile={userProfile} isOwnProfile={true} />

        {/* Stats */}
        <ProfileStats stats={stats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/profile/rsvps"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My RSVPs</h3>
                <p className="text-sm text-gray-600">View all your events</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/settings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Account preferences</p>
              </div>
            </div>
          </Link>

          {profile.user_type === "venue" && (
            <Link
              href="/dashboard"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage your events</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
