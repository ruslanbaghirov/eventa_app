// types/profile.ts

/**
 * USER PROFILE TYPES
 *
 * Complete TypeScript interfaces for user profiles,
 * notification preferences, and RSVP history
 */

export interface UserProfile {
  id: string;
  email: string;
  user_type: "user" | "venue";
  is_admin: boolean;
  venue_name?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  favorite_categories: string[];
  notification_preferences: NotificationPreferences;
  created_at: string;
}

export interface NotificationPreferences {
  event_updates: boolean; // When RSVP'd event is updated
  event_reminders: boolean; // 1 day before event
  event_cancellations: boolean; // When RSVP'd event is cancelled
  weekly_digest: boolean; // Weekly email with new events
  security_alerts: boolean; // Password changes, etc.
}

export interface RSVPWithEvent {
  id: string;
  event_id: string;
  rsvp_type: "interested" | "going";
  status: "active" | "cancelled";
  created_at: string;
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    price: number;
    venue_name: string;
    image_url: string | null;
    status: string;
    capacity: number | null;
  };
}

export interface ProfileStats {
  total_rsvps: number;
  upcoming_events: number;
  past_events: number;
  interested_count: number;
  going_count: number;
}

export const CATEGORIES = [
  "Music",
  "Art",
  "Comedy",
  "Tech",
  "Food",
  "Sports",
  "Education",
  "Networking",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
