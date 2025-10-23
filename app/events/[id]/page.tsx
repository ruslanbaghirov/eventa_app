// app/events/[id]/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Users,
  Star,
  Check,
  MessageCircle,
  Mail,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import RSVPButton from "@/app/components/events/RSVPButton";
import { formatTimeAgo, wasRecentlyUpdated } from "@/app/lib/utils/time";

/**
 * EVENT DETAIL PAGE
 * Route: /events/[id]
 *
 * What this shows:
 * - Complete event information
 * - RSVP buttons (Interested/Going)
 * - RSVP counts and capacity
 * - Contact organizer section
 * - "Updated" badge if recently edited
 */

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerClient();

  // Fetch event
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("status", "approved")
    .single();

  if (error || !event) {
    notFound();
  }

  // Get RSVP counts
  const { count: interestedCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("rsvp_type", "interested")
    .eq("status", "active");

  const { count: goingCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("rsvp_type", "going")
    .eq("status", "active");

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's RSVP if logged in - with proper typing
  let currentRSVP: "interested" | "going" | undefined = undefined;
  if (user) {
    const { data } = await supabase
      .from("rsvps")
      .select("rsvp_type")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .eq("status", "active")
      .single();

    // Type-safe assignment
    if (
      data &&
      (data.rsvp_type === "interested" || data.rsvp_type === "going")
    ) {
      currentRSVP = data.rsvp_type;
    }
  }

  // Calculate capacity - with proper null handling
  const capacityPercentage = event.capacity
    ? Math.round(((goingCount || 0) / event.capacity) * 100)
    : null;

  const isNearCapacity =
    capacityPercentage !== null && capacityPercentage >= 80;
  const isAtCapacity = capacityPercentage !== null && capacityPercentage >= 100;

  // Check if recently updated
  const showUpdatedBadge = wasRecentlyUpdated(
    event.updated_at,
    event.created_at
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Image */}
          {event.image_url ? (
            <div className="w-full h-96 rounded-lg overflow-hidden mb-6 shadow-lg">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-96 rounded-lg overflow-hidden mb-6 shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <Calendar className="w-24 h-24 text-white opacity-50" />
            </div>
          )}

          {/* Event Info */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Category + Updated Badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {event.category}
              </span>

              {/* UPDATED BADGE */}
              {showUpdatedBadge && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  <Clock className="w-4 h-4" />
                  Updated {formatTimeAgo(event.updated_at)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>

            {/* Venue */}
            <p className="text-lg text-gray-600 mb-6">
              Organized by{" "}
              <span className="font-semibold">{event.venue_name}</span>
            </p>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-900">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-gray-900">
                    {event.price === 0 ? "Free" : `${event.price} AZN`}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                About This Event
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* RSVP Section */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Join This Event
                </h2>
              </div>

              {/* RSVP Counts */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-900">
                    {interestedCount || 0}
                  </span>
                  <span className="text-gray-600">interested</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-bold text-gray-900">
                    {goingCount || 0}
                  </span>
                  <span className="text-gray-600">going</span>
                </div>
              </div>

              {/* Capacity Progress - FIXED NULL CHECK */}
              {event.capacity && capacityPercentage !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Event Capacity</span>
                    <span className="font-semibold">
                      {goingCount || 0} / {event.capacity} spots filled
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isAtCapacity
                          ? "bg-red-500"
                          : isNearCapacity
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                  {isAtCapacity && (
                    <p className="text-sm text-red-600 font-semibold mt-2">
                      ⚠️ This event is at full capacity for "Going" RSVPs. You
                      can still mark as "Interested".
                    </p>
                  )}
                  {isNearCapacity && !isAtCapacity && (
                    <p className="text-sm text-yellow-600 font-semibold mt-2">
                      ⚠️ Only {event.capacity - (goingCount || 0)} spots left!
                    </p>
                  )}
                </div>
              )}

              {/* RSVP Buttons - FIXED TYPE */}
              <RSVPButton
                eventId={event.id}
                eventTitle={event.title}
                currentRSVP={currentRSVP}
                capacity={event.capacity}
                currentGoingCount={goingCount || 0}
              />
            </div>

            {/* Contact Organizer Section */}
            {(event.contact_whatsapp ||
              event.contact_email ||
              event.booking_link) && (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Organizer
                </h2>
                <div className="space-y-3">
                  {event.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${event.contact_whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors border border-gray-200 hover:border-green-300"
                    >
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        Message on WhatsApp
                      </span>
                    </a>
                  )}

                  {event.contact_email && (
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        Send Email
                      </span>
                    </a>
                  )}

                  {event.booking_link && (
                    <a
                      href={event.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-300"
                    >
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">
                        Book Tickets
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
