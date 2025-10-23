// app/admin/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";
import ApproveRejectButtons from "@/app/components/admin/ApproveRejectButtons";
import CancellationApprovalButtons from "@/app/components/admin/CancellationApprovalButtons";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from "lucide-react";

/**
 * ADMIN DASHBOARD - WITH CANCELLATION APPROVAL
 * Route: /admin
 *
 * What this does:
 * - Shows pending events for approval
 * - Shows cancellation requests for approval
 * - Shows approved/rejected events
 * - Admin can approve/reject both new events and cancellations
 *
 * New Feature:
 * - Cancellation Requests section
 * - Approve/Reject cancellation buttons
 * - Shows reason for cancellation
 */

export default async function AdminPage() {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=/admin");
  }

  // Get user's profile to check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Redirect if not admin
  if (!profile || !profile.is_admin) {
    redirect("/events");
  }

  // Fetch all events
  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  // Separate events by status
  const pendingEvents = allEvents?.filter((e) => e.status === "pending") || [];
  const approvedEvents =
    allEvents?.filter((e) => e.status === "approved") || [];
  const rejectedEvents =
    allEvents?.filter((e) => e.status === "rejected") || [];

  // NEW: Cancellation requests (events with cancellation_requested = true)
  const cancellationRequests =
    allEvents?.filter(
      (e) =>
        e.cancellation_requested === true &&
        e.cancellation_approved_by_admin === false
    ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage events & cancellations
              </p>
            </div>
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Pending */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingEvents.length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Cancellation Requests (NEW) */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Cancel Requests
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {cancellationRequests.length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Ban className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {approvedEvents.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {rejectedEvents.length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* CANCELLATION REQUESTS SECTION (NEW) */}
        {cancellationRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Ban className="w-6 h-6 text-orange-600" />
              Cancellation Requests ({cancellationRequests.length})
            </h2>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Important:</strong> Review these carefully. Approving
                a cancellation will mark the event as cancelled and notify all
                attendees.
              </p>
            </div>

            <div className="space-y-6">
              {cancellationRequests.map((event) => (
                <div
                  key={event.id}
                  className="border border-orange-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-orange-50"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">
                              Cancellation Requested
                            </span>
                          </div>
                          <p className="text-gray-600">
                            by{" "}
                            <span className="font-semibold">
                              {event.venue_name}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Event Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{event.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">
                            {event.price === 0 ? "Free" : `${event.price} AZN`}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      <div className="mb-4 p-4 bg-white border border-orange-200 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                          📝 Cancellation Reason:
                        </p>
                        <p className="text-sm text-gray-700">
                          {event.cancellation_reason}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Requested on:{" "}
                          {new Date(
                            event.cancellation_requested_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <CancellationApprovalButtons
                        eventId={event.id}
                        eventTitle={event.title}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Events Section (same as before) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Events ({pendingEvents.length})
          </h2>

          {pendingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No events pending review</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row">
                    {event.image_url && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              {event.category}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            by{" "}
                            <span className="font-semibold">
                              {event.venue_name}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{event.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">
                            {event.price === 0 ? "Free" : `${event.price} AZN`}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {event.capacity !== null && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                Capacity Limit Set
                              </p>
                              <p className="text-sm text-blue-800">
                                Maximum <strong>{event.capacity}</strong>{" "}
                                "Going" RSVPs allowed
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <ApproveRejectButtons eventId={event.id} />
                        <Link
                          href={`/events/${event.id}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Events Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Approved Events ({approvedEvents.length})
          </h2>

          {approvedEvents.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No approved events yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {event.category}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      ✓ Approved
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {event.venue_name}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </p>

                  {event.capacity !== null && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <Users className="w-3 h-3" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}

                  <Link
                    href={`/events/${event.id}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline inline-block"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {approvedEvents.length > 6 && (
            <p className="text-sm text-gray-600 text-center mt-4">
              And {approvedEvents.length - 6} more approved events...
            </p>
          )}
        </div>

        {/* Rejected Events Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Rejected Events ({rejectedEvents.length})
          </h2>

          {rejectedEvents.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No rejected events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejectedEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          ✗ Rejected
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.venue_name}
                      </p>
                      {event.rejection_reason && (
                        <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                          <strong>Reason:</strong> {event.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
