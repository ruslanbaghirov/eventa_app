// components/profile/ProfileHeader.tsx

import Avatar from "@/app/components/ui/Avatar";
import { Calendar, MapPin, Mail, Phone, Edit } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/app/types/profile";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name || profile.email}
            size="xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.display_name || "Anonymous User"}
              </h1>
              <p className="text-gray-600">
                {profile.user_type === "venue" ? "Venue" : "Event Goer"}
                {profile.venue_name && ` • ${profile.venue_name}`}
              </p>
            </div>

            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Member since{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Favorite Categories */}
          {profile.favorite_categories &&
            profile.favorite_categories.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Interests:
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
