// app/events/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, Star, Check, Clock } from "lucide-react";
import RSVPButton from "@/app/components/events/RSVPButton";
import { formatTimeAgo, wasRecentlyUpdated } from "@/app/lib/utils/time";

/**
 * PUBLIC EVENTS LISTING PAGE
 * Route: /events
 *
 * What this shows:
 * - All approved events
 * - RSVP counts (interested/going)
 * - Capacity progress bars
 * - "Updated" badge for recently edited events (within 7 days)
 * - User can RSVP directly from listing
 */

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await createServerClient();

  // Fetch all approved events
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .gte("date", new Date().toISOString().split("T")[0]) // Only upcoming events
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
  }

  // Get RSVP counts for each event
  const eventsWithRSVPs = await Promise.all(
    (events || []).map(async (event) => {
      // Get interested count
      const { count: interestedCount } = await supabase
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("rsvp_type", "interested")
        .eq("status", "active");

      // Get going count
      const { count: goingCount } = await supabase
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("rsvp_type", "going")
        .eq("status", "active");

      return {
        ...event,
        interestedCount: interestedCount || 0,
        goingCount: goingCount || 0,
      };
    })
  );

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's RSVPs if logged in
  let userRSVPs: Array<{
    event_id: string;
    rsvp_type: "interested" | "going";
  }> = [];
  if (user) {
    const { data } = await supabase
      .from("rsvps")
      .select("event_id, rsvp_type")
      .eq("user_id", user.id)
      .eq("status", "active");

    userRSVPs =
      (data as Array<{
        event_id: string;
        rsvp_type: "interested" | "going";
      }>) || [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Discover Events
              </h1>
              <p className="text-gray-600 mt-1">
                Find amazing experiences in Baku
              </p>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 font-semibold hover:underline"
                  >
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-900 font-semibold hover:underline"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-semibold hover:underline"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Events Grid */}
        {eventsWithRSVPs.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No events yet
            </h3>
            <p className="text-gray-500">
              Check back soon for exciting events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsWithRSVPs.map((event) => {
              // Check if user has RSVP'd - with proper type
              const userRSVP = userRSVPs.find((r) => r.event_id === event.id);
              const currentRSVP: "interested" | "going" | undefined =
                userRSVP?.rsvp_type;

              // Calculate capacity percentage (with null check)
              const capacityPercentage = event.capacity
                ? Math.round((event.goingCount / event.capacity) * 100)
                : null;

              const isNearCapacity =
                capacityPercentage !== null && capacityPercentage >= 80;
              const isAtCapacity =
                capacityPercentage !== null && capacityPercentage >= 100;

              // Check if recently updated - THIS IS THE KEY PART
              const showUpdatedBadge = wasRecentlyUpdated(
                event.updated_at,
                event.created_at
              );

              // Log for debugging (you can remove this later)
              if (event.id) {
                console.log(`Event: ${event.title}`);
                console.log(`  Created: ${event.created_at}`);
                console.log(`  Updated: ${event.updated_at}`);
                console.log(`  Show badge: ${showUpdatedBadge}`);
              }

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Event Image */}
                  <Link href={`/events/${event.id}`}>
                    {event.image_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    {/* Category + Updated Badge - THIS IS WHERE THE BADGE APPEARS */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {event.category}
                      </span>

                      {/* UPDATED BADGE - LOOK HERE! */}
                      {showUpdatedBadge && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Updated {formatTimeAgo(event.updated_at)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/events/${event.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                    </Link>

                    {/* Venue */}
                    <p className="text-sm text-gray-600 mb-3">
                      by {event.venue_name}
                    </p>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">
                          {event.price === 0 ? "Free" : `${event.price} AZN`}
                        </span>
                      </div>
                    </div>

                    {/* RSVP Counts */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4" />
                        <span className="font-semibold">
                          {event.interestedCount}
                        </span>
                        <span className="text-gray-600">interested</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="font-semibold">
                          {event.goingCount}
                        </span>
                        <span className="text-gray-600">going</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    {event.capacity && capacityPercentage !== null && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Capacity</span>
                          <span className="font-semibold">
                            {event.goingCount} / {event.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isAtCapacity
                                ? "bg-red-500"
                                : isNearCapacity
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(capacityPercentage, 100)}%`,
                            }}
                          />
                        </div>
                        {isAtCapacity && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            At capacity
                          </p>
                        )}
                      </div>
                    )}

                    {/* RSVP Buttons */}
                    <RSVPButton
                      eventId={event.id}
                      eventTitle={event.title}
                      currentRSVP={currentRSVP}
                      capacity={event.capacity}
                      currentGoingCount={event.goingCount}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
