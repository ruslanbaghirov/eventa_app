// app/types/index.ts

/**
 * DATABASE TYPES
 * TypeScript interfaces that match our Supabase database schema
 *
 * Why we define these:
 * - TypeScript knows what properties each object has
 * - Get autocomplete in VS Code
 * - Catch typos and errors before runtime
 * - Self-documenting code
 */

// ============================================
// EVENT TYPE
// ============================================
// Represents an event in our database
export interface Event {
  id: string;
  title: string;
  description: string;
  venue_name: string;
  venue_id: string | null; // Changed: can be null initially
  venue_user_id: string | null; // NEW: links to profiles table
  date: string; // Format: "2024-11-15"
  time: string; // Format: "20:00:00"
  location: string;
  image_url: string | null;
  category: string;
  price: number;
  capacity: number;
  attendees_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// PROFILE TYPE
// ============================================
// Represents a user or venue profile
// Links to auth.users table via id
export interface Profile {
  id: string; // Same as auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;

  // User type determines features available
  user_type: "user" | "venue"; // Only these two values allowed

  // Venue-specific fields (only filled if user_type = 'venue')
  venue_name: string | null;
  venue_description: string | null;
  venue_location: string | null;
  venue_phone: string | null;
  venue_website: string | null;

  created_at: string;
  updated_at: string;
}

// ============================================
// RSVP TYPE
// ============================================
// Tracks who's attending which events
// We'll build this in Phase 5, but defining the type now
export interface RSVP {
  id: string;
  event_id: string; // Foreign key to events
  user_id: string; // Foreign key to profiles
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string | null;
  quantity: number;
  total_amount: number;
  payment_status: "pending" | "confirmed" | "paid" | "cancelled";
  payment_method: "cash_at_door" | "bank_transfer" | "whatsapp" | "online";
  confirmation_code: string;
  checked_in: boolean;
  created_at: string;
}

// ============================================
// AUTH USER TYPE (From Supabase)
// ============================================
// This is what Supabase Auth returns
// We don't store this, but we use it to check if user is logged in
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// ============================================
// SESSION TYPE
// ============================================
// Represents a user's logged-in session
export interface Session {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * WHY WE USE TYPES:
 *
 * Without TypeScript:
 * const profile = getProfile()
 * console.log(profile.nam)  // ❌ Typo! But JavaScript doesn't catch it
 *
 * With TypeScript:
 * const profile: Profile = getProfile()
 * console.log(profile.nam)  // ✅ Error: "nam" doesn't exist, did you mean "name"?
 *
 * This saves hours of debugging!
 */
