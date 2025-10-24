// app/profile/edit/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";
import ProfileEditForm from "@/app/components/profile/ProfileEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserProfile } from "@/app/types/profile";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Profile error:", error);
    redirect("/login");
  }

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
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">
                Update your personal information
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ProfileEditForm profile={userProfile} />
        </div>
      </div>
    </div>
  );
}
