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
  Share2,
} from "lucide-react";
import RSVPButton from "@/app/components/events/RSVPButton";
import { formatTimeAgo, wasRecentlyUpdated } from "@/app/lib/utils/time";
import StickyBottomBar from "@/app/components/events/StickyBottomBar";
import Footer from "@/app/components/layout/Footer";

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - Main Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Badge & Updated Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1.5 bg-gray-900 text-white text-sm font-bold rounded-md border-2 border-gray-900">
                  {event.category}
                </span>

                {showUpdatedBadge && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-md border-2 border-amber-300">
                    <Clock className="w-3 h-3" />
                    Updated {formatTimeAgo(event.updated_at)}
                  </span>
                )}
              </div>

              {/* Title Section */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-300">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl">
                  {event.venue_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hosted by</p>
                  <p className="text-lg font-bold text-gray-900">
                    {event.venue_name}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Details
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Event Info & Image (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Event Image */}
                <div className="rounded-lg overflow-hidden border-4 border-gray-900 shadow-xl">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Date & Time Container */}
                <div className="bg-gray-50 rounded-md border-2 border-gray-400 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date and time</p>
                      <p className="font-bold text-gray-900">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="font-semibold text-gray-700 mt-1">
                        {event.time}
                      </p>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="font-bold text-gray-900">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Price</p>
                        <p className="font-bold text-gray-900 text-xl">
                          {event.price === 0 ? "Free" : `${event.price} AZN`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RSVP Stats */}
                <div className="bg-gray-50 rounded-md border-2 border-gray-400 p-6">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gray-900" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {interestedCount || 0}
                        </p>
                        <p className="text-xs text-gray-600">interested</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-gray-900" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {goingCount || 0}
                        </p>
                        <p className="text-xs text-gray-600">going</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Progress */}
                  {event.capacity && capacityPercentage !== null && (
                    <div className="pt-4 border-t-2 border-gray-300">
                      <div className="flex items-center justify-between text-sm text-gray-700 mb-2 font-bold">
                        <span>Capacity</span>
                        <span>
                          {goingCount || 0} / {event.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-sm h-3 overflow-hidden border-2 border-gray-400">
                        <div
                          className={`h-full transition-all ${
                            isAtCapacity
                              ? "bg-red-600"
                              : isNearCapacity
                              ? "bg-amber-500"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${Math.min(capacityPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      {isAtCapacity && (
                        <p className="text-xs text-red-700 font-bold mt-2">
                          ⚠️ At capacity
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Organizer Section */}
                {(event.contact_whatsapp ||
                  event.contact_email ||
                  event.booking_link) && (
                  <div className="bg-gray-50 rounded-md border-2 border-gray-400 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">
                      Contact Organizer
                    </h3>
                    <div className="space-y-3">
                      {event.contact_whatsapp && (
                        <a
                          href={`https://wa.me/${event.contact_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-md border-2 border-gray-400 hover:border-gray-900 transition-all"
                        >
                          <MessageCircle className="w-5 h-5 text-gray-900" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              WhatsApp
                            </p>
                            <p className="text-xs text-gray-600">
                              {event.contact_whatsapp}
                            </p>
                          </div>
                        </a>
                      )}

                      {event.contact_email && (
                        <a
                          href={`mailto:${event.contact_email}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-md border-2 border-gray-400 hover:border-gray-900 transition-all"
                        >
                          <Mail className="w-5 h-5 text-gray-900" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Email
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {event.contact_email}
                            </p>
                          </div>
                        </a>
                      )}

                      {event.booking_link && (
                        <a
                          href={event.booking_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-md border-2 border-gray-400 hover:border-gray-900 transition-all"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-900" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Book Tickets
                            </p>
                            <p className="text-xs text-gray-600">
                              External booking link
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        event={{
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image_url: event.image_url,
        }}
        interestedCount={interestedCount || 0}
        goingCount={goingCount || 0}
        currentRSVP={currentRSVP}
        capacity={event.capacity}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
