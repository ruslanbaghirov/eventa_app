// app/dashboard/events/page.tsx

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Eye,
  TrendingUp,
  Star,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";

/**
 * VENUE EVENTS DASHBOARD - WITH EDIT CAPABILITY
 * Route: /dashboard/events
 *
 * What this shows:
 * - All events created by the venue
 * - Automatic separation: Upcoming vs Past
 * - Real-time analytics (RSVPs, engagement)
 * - Edit button on all events
 * - Compact list for past/rejected events
 */

export default function VenueEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPastEvent, setExpandedPastEvent] = useState<string | null>(
    null
  );
  const [expandedRejectedEvent, setExpandedRejectedEvent] = useState<
    string | null
  >(null);

  const supabase = createClient();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .eq("venue_user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const today = new Date().toISOString().split("T")[0];

      const eventsWithAnalytics = await Promise.all(
        (eventsData || []).map(async (event) => {
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

          const totalRSVPs = (interestedCount || 0) + (goingCount || 0);
          const capacityUtilization = event.capacity
            ? Math.round(((goingCount || 0) / event.capacity) * 100)
            : null;

          const isPast = event.date < today;

          return {
            ...event,
            analytics: {
              interestedCount: interestedCount || 0,
              goingCount: goingCount || 0,
              totalRSVPs,
              capacityUtilization,
            },
            isPast,
          };
        })
      );

      setEvents(eventsWithAnalytics);
    } catch (err: any) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }

  const upcomingEvents = events.filter(
    (e) => !e.isPast && e.status === "approved"
  );
  const pastEvents = events.filter((e) => e.isPast && e.status !== "rejected");
  const pendingEvents = events.filter((e) => e.status === "pending");
  const rejectedEvents = events.filter((e) => e.status === "rejected");

  const totalRSVPs = events.reduce((sum, e) => sum + e.analytics.totalRSVPs, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-1">
                Manage your events and track engagement
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-semibold hover:underline"
              >
                ← Dashboard
              </Link>
              <Link
                href="/dashboard/events/new"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Event
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {upcomingEvents.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Past Events
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  {pastEvents.length}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingEvents.length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total RSVPs
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalRSVPs}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Events */}
        {pendingEvents.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>{pendingEvents.length}</strong> event
                  {pendingEvents.length !== 1 ? "s" : ""} waiting for admin
                  approval
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingEvents.map((event) => (
                <FullEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Upcoming Events ({upcomingEvents.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <FullEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Past Events (Compact) */}
        {pastEvents.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Past Events ({pastEvents.length})
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total engagement:{" "}
                    <strong className="text-purple-600">
                      {pastEvents.reduce(
                        (sum, e) => sum + e.analytics.totalRSVPs,
                        0
                      )}{" "}
                      RSVPs
                    </strong>
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {pastEvents.map((event) => (
                  <CompactEventItem
                    key={event.id}
                    event={event}
                    isExpanded={expandedPastEvent === event.id}
                    onToggle={() =>
                      setExpandedPastEvent(
                        expandedPastEvent === event.id ? null : event.id
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rejected Events (Compact) */}
        {rejectedEvents.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 p-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Rejected Events ({rejectedEvents.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {rejectedEvents.map((event) => (
                  <CompactEventItem
                    key={event.id}
                    event={event}
                    isExpanded={expandedRejectedEvent === event.id}
                    onToggle={() =>
                      setExpandedRejectedEvent(
                        expandedRejectedEvent === event.id ? null : event.id
                      )
                    }
                    isRejected={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No events yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first event to start engaging with customers
            </p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// FULL EVENT CARD - For Upcoming/Pending Events
function FullEventCard({ event }: { event: any }) {
  const { analytics } = event;

  // Status colors defined HERE (inside the component)
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    cancelled: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const isNearCapacity = event.capacity && analytics.capacityUtilization >= 80;
  const isAtCapacity = event.capacity && analytics.capacityUtilization >= 100;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
      {event.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                statusColors[event.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
          <Calendar className="w-16 h-16 text-white opacity-50" />
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                statusColors[event.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
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
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">
              {event.price === 0 ? "Free" : `${event.price} AZN`}
            </span>
          </div>
        </div>

        {/* Analytics */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Engagement Analytics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">Interested</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.interestedCount}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">Going</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.goingCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total RSVPs:</span>
            <span className="font-bold text-purple-600">
              {analytics.totalRSVPs}
            </span>
          </div>

          {event.capacity && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold text-gray-900">
                  {analytics.goingCount} / {event.capacity}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isAtCapacity
                      ? "bg-red-500"
                      : isNearCapacity
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(analytics.capacityUtilization, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-1">
                {isAtCapacity ? (
                  <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    At Capacity
                  </span>
                ) : isNearCapacity ? (
                  <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {event.capacity - analytics.goingCount} spots left
                  </span>
                ) : (
                  <span className="text-xs text-green-600 font-semibold">
                    {analytics.capacityUtilization}% filled
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Link>

          <Link
            href={`/events/${event.id}`}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-all text-sm"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>

          {event.status === "approved" && analytics.totalRSVPs > 0 && (
            <Link
              href={`/dashboard/events/${event.id}/attendees`}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg font-semibold transition-all text-sm"
            >
              <Users className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Rejection Reason */}
        {event.status === "rejected" && event.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-900 mb-1">
              Rejection Reason:
            </p>
            <p className="text-xs text-red-700">{event.rejection_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// COMPACT EVENT ITEM - For Past/Rejected Events
function CompactEventItem({
  event,
  isExpanded,
  onToggle,
  isRejected = false,
}: {
  event: any;
  isExpanded: boolean;
  onToggle: () => void;
  isRejected?: boolean;
}) {
  const { analytics } = event;

  return (
    <div className="hover:bg-gray-50 transition-colors">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
              {event.price > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {event.price} AZN
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4" />
                <span className="font-bold">{analytics.interestedCount}</span>
              </div>
              <span className="text-xs text-gray-500">interested</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                <span className="font-bold">{analytics.goingCount}</span>
              </div>
              <span className="text-xs text-gray-500">going</span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Location</p>
                <p className="text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total RSVPs</p>
                <p className="text-purple-600 font-bold">
                  {analytics.totalRSVPs}
                </p>
              </div>
            </div>

            {event.capacity && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-semibold">
                    {analytics.goingCount} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(analytics.capacityUtilization, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {isRejected && event.rejection_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-900 mb-1">
                  Rejection Reason:
                </p>
                <p className="text-xs text-red-700">{event.rejection_reason}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>

              <Link
                href={`/events/${event.id}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-all text-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>

              {analytics.totalRSVPs > 0 && (
                <Link
                  href={`/dashboard/events/${event.id}/attendees`}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg font-semibold transition-all text-sm"
                >
                  <Users className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
