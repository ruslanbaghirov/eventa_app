// app/dashboard/page.tsx

import { createServerClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  TrendingUp,
  Trophy,
  Target,
} from "lucide-react";

/**
 * VENUE DASHBOARD - WITH BASIC ANALYTICS
 *
 * New Features:
 * - Shows venue's total event count
 * - Shows upcoming vs past events
 * - Performance indicators
 * - Motivational messaging
 *
 * Why this drives engagement:
 * - Venues see their progress
 * - Creates sense of accomplishment
 * - Motivates to create more events
 */

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "venue") {
    redirect("/events");
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Fetch all events for stats
  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .eq("venue_user_id", user.id);

  // Calculate comprehensive stats
  const totalEvents = allEvents?.length || 0;
  const upcomingEvents = allEvents?.filter((e) => e.date >= today).length || 0;
  const pastEvents = allEvents?.filter((e) => e.date < today).length || 0;
  const pendingEvents =
    allEvents?.filter((e) => e.status === "pending").length || 0;
  const approvedEvents =
    allEvents?.filter((e) => e.status === "approved").length || 0;
  const rejectedEvents =
    allEvents?.filter((e) => e.status === "rejected").length || 0;

  // Calculate approval rate
  const approvalRate =
    totalEvents > 0 ? Math.round((approvedEvents / totalEvents) * 100) : 0;

  // Get recent UPCOMING events only (last 5 future events)
  const { data: recentEvents } = await supabase
    .from("events")
    .select("*")
    .eq("venue_user_id", user.id)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(5);

  // Performance level based on events
  const getPerformanceLevel = (count: number) => {
    if (count === 0)
      return { level: "Getting Started", color: "gray", icon: "🌱" };
    if (count < 5) return { level: "Active", color: "blue", icon: "🚀" };
    if (count < 10) return { level: "Growing", color: "green", icon: "📈" };
    if (count < 20) return { level: "Thriving", color: "purple", icon: "⭐" };
    return { level: "Top Performer", color: "yellow", icon: "🏆" };
  };

  const performance = getPerformanceLevel(totalEvents);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile.venue_name || profile.full_name}! 👋
                </h1>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm font-semibold rounded-full">
                  {performance.icon} {performance.level}
                </span>
              </div>
              <p className="text-gray-600">
                Manage your events and track their performance
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
        {/* Performance Overview Card */}
        {totalEvents > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2">📊 Your Performance</h2>
                <p className="text-blue-100">
                  You're doing great! Keep creating amazing events.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalEvents}</p>
                  <p className="text-sm text-blue-100">Total Events</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{approvalRate}%</p>
                  <p className="text-sm text-blue-100">Approval Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{upcomingEvents}</p>
                  <p className="text-sm text-blue-100">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Events Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {pastEvents} completed, {upcomingEvents} upcoming
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {approvedEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {approvalRate}% approval rate
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {rejectedEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">Review feedback</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Motivation */}
        {totalEvents === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🚀 Ready to get started?
                </h3>
                <p className="text-gray-700 mb-4">
                  Create your first event and start attracting attendees! Our
                  most successful venues post their first event within 24 hours
                  of signing up.
                </p>
                <Link
                  href="/dashboard/events/new"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Event
                </Link>
              </div>
            </div>
          </div>
        )}

        {totalEvents > 0 && totalEvents < 5 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📈 You're making progress!
                </h3>
                <p className="text-gray-700 mb-2">
                  Great start! Venues with 5+ events get{" "}
                  <strong>3x more visibility</strong> on our platform.
                </p>
                <p className="text-sm text-gray-600">
                  💡 Tip: Post consistent events (weekly or monthly) to build an
                  audience.
                </p>
              </div>
            </div>
          </div>
        )}

        {totalEvents >= 5 && approvalRate >= 80 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🏆 You're a top performer!
                </h3>
                <p className="text-gray-700 mb-2">
                  With {totalEvents} events and {approvalRate}% approval rate,
                  you're in the <strong>top 20%</strong> of venues!
                </p>
                <p className="text-sm text-gray-600">
                  🌟 Keep up the amazing work. You're building a great
                  reputation!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/events/new"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Create New Event
            </Link>

            <Link
              href="/dashboard/events"
              className="flex-1 bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-lg font-semibold text-center transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              View All My Events
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h2>
            {upcomingEvents > 5 && (
              <Link
                href="/dashboard/events?tab=upcoming"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
              >
                View all {upcomingEvents} →
              </Link>
            )}
          </div>

          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : event.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.status === "approved" && "✓ Approved"}
                          {event.status === "pending" && "⏳ Pending"}
                          {event.status === "rejected" && "✗ Rejected"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        📅{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        • ⏰ {event.time}
                      </p>
                      <p className="text-gray-600 text-sm">
                        📍 {event.location}
                      </p>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No upcoming events
              </h3>
              <p className="text-gray-600 mb-6">
                Create your next event to get started!
              </p>
              <Link
                href="/dashboard/events/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Create Your Next Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
