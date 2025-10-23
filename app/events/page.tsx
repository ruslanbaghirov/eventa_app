// app/events/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  DollarSign,
  Star,
  Check,
  Clock,
  Search,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import RSVPButton from "@/app/components/events/RSVPButton";
import { formatTimeAgo, wasRecentlyUpdated } from "@/app/lib/utils/time";

/**
 * PUBLIC EVENTS LISTING PAGE WITH SEARCH & FILTERS
 * Route: /events
 *
 * Features:
 * - Keyword search (title, description, venue)
 * - Category filter (Music, Art, Food, etc.)
 * - Price filter (All, Free, Paid)
 * - Sort options (Date, Popularity)
 * - Active filter chips
 * - Result count
 * - Empty state
 * - Fully responsive
 */

const CATEGORIES = [
  "All Categories",
  "Music",
  "Art",
  "Comedy",
  "Tech",
  "Food & Drink",
  "Wellness",
  "Education",
  "Entertainment",
  "Networking",
  "Other",
];

const PRICE_OPTIONS = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free Only" },
  { value: "paid", label: "Paid Only" },
];

const SORT_OPTIONS = [
  { value: "date-asc", label: "Date (Soonest First)" },
  { value: "date-desc", label: "Date (Latest First)" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
];

export default function EventsPage() {
  // State for events data
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRSVPs, setUserRSVPs] = useState<any[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedSort, setSelectedSort] = useState("date-asc");

  const supabase = createClient();

  // Load events and user data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch all approved upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      // Get RSVP counts for each event
      const eventsWithRSVPs = await Promise.all(
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

          return {
            ...event,
            interestedCount: interestedCount || 0,
            goingCount: goingCount || 0,
            totalRSVPs: (interestedCount || 0) + (goingCount || 0),
          };
        })
      );

      setEvents(eventsWithRSVPs);

      // Get user's RSVPs if logged in
      if (currentUser) {
        const { data: rsvpData } = await supabase
          .from("rsvps")
          .select("event_id, rsvp_type")
          .eq("user_id", currentUser.id)
          .eq("status", "active");

        setUserRSVPs(rsvpData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.venue_name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Price filter
    if (selectedPrice === "free") {
      filtered = filtered.filter((event) => event.price === 0);
    } else if (selectedPrice === "paid") {
      filtered = filtered.filter((event) => event.price > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "popular":
          return b.totalRSVPs - a.totalRSVPs;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, selectedCategory, selectedPrice, selectedSort]);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedPrice !== "all";

  // Clear all filters
  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedPrice("all");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              EventHub
            </Link>
            <div className="flex items-center gap-3">
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

      {/* Search & Filters Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Discover Events
            </h1>
            <p className="text-gray-600 mt-1">
              Find amazing experiences in Baku
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, venues, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {PRICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters & Clear Button */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Active:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Search: "
                  {searchQuery.length > 20
                    ? searchQuery.substring(0, 20) + "..."
                    : searchQuery}
                  "
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== "All Categories" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All Categories")}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPrice !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {selectedPrice === "free" ? "Free Only" : "Paid Only"}
                  <button
                    onClick={() => setSelectedPrice("all")}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Result Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredEvents.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">{events.length}</span>{" "}
              events
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredEvents.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mb-4">
              <Search className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Check back soon for exciting events!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <X className="w-5 h-5" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          // Events Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const userRSVP = userRSVPs.find((r) => r.event_id === event.id);
              const currentRSVP: "interested" | "going" | undefined =
                userRSVP?.rsvp_type;

              const capacityPercentage = event.capacity
                ? Math.round((event.goingCount / event.capacity) * 100)
                : null;

              const isNearCapacity =
                capacityPercentage !== null && capacityPercentage >= 80;
              const isAtCapacity =
                capacityPercentage !== null && capacityPercentage >= 100;

              const showUpdatedBadge = wasRecentlyUpdated(
                event.updated_at,
                event.created_at
              );

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
                    {/* Category + Updated Badge */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {event.category}
                      </span>

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
