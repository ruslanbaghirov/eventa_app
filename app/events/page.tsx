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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              EventHub
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-900 hover:text-gray-600 font-semibold transition-colors"
                  >
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-gray-900 hover:text-gray-600 font-semibold transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-900 hover:text-gray-600 font-semibold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-md font-semibold transition-all border-2 border-gray-900"
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
      <div className="bg-gray-50 border-b-2 border-gray-300">
        <div className="container mx-auto px-4 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Discover Events
            </h1>
            <p className="text-gray-700 text-lg">
              Find amazing experiences in Baku
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, venues, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-900 text-gray-900 placeholder-gray-500 font-medium bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3 mb-5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-400 rounded-md bg-white text-gray-900 font-semibold hover:border-gray-900 focus:outline-none focus:border-gray-900 cursor-pointer"
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
              className="px-4 py-2.5 border-2 border-gray-400 rounded-md bg-white text-gray-900 font-semibold hover:border-gray-900 focus:outline-none focus:border-gray-900 cursor-pointer"
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
              className="px-4 py-2.5 border-2 border-gray-400 rounded-md bg-white text-gray-900 font-semibold hover:border-gray-900 focus:outline-none focus:border-gray-900 cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm text-gray-700 font-bold">
                Active filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 text-sm font-bold rounded-md">
                  Search: "
                  {searchQuery.length > 20
                    ? searchQuery.substring(0, 20) + "..."
                    : searchQuery}
                  "
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCategory !== "All Categories" && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 text-sm font-bold rounded-md">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All Categories")}
                    className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedPrice !== "all" && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 text-sm font-bold rounded-md">
                  {selectedPrice === "free" ? "Free Only" : "Paid Only"}
                  <button
                    onClick={() => setSelectedPrice("all")}
                    className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-gray-900 hover:text-gray-600 font-bold underline ml-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Result Count */}
          <div className="pt-5 border-t-2 border-gray-300">
            <p className="text-sm text-gray-700 font-semibold">
              <span className="text-gray-900 font-bold text-base">
                {filteredEvents.length}
              </span>{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
              {events.length !== filteredEvents.length && (
                <span className="text-gray-600 font-normal">
                  {" "}
                  • {events.length} total
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-10">
        {filteredEvents.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-gray-50 border-2 border-gray-300 rounded-md">
            <div className="mb-4">
              <Search className="w-20 h-20 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No events found
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Check back soon for exciting events!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-bold transition-all border-2 border-gray-900"
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
                  className="bg-white rounded-md border-2 border-gray-400 overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all"
                >
                  {/* Event Image */}
                  <Link href={`/events/${event.id}`}>
                    {event.image_url ? (
                      <div className="relative h-48 overflow-hidden border-b-2 border-gray-400">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center border-b-2 border-gray-400">
                        <Calendar className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    {/* Category + Updated Badge */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-md border-2 border-gray-900">
                        {event.category}
                      </span>

                      {showUpdatedBadge && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-md border-2 border-amber-300">
                          <Clock className="w-3 h-3" />
                          Updated {formatTimeAgo(event.updated_at)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/events/${event.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:underline transition-all">
                        {event.title}
                      </h3>
                    </Link>

                    {/* Venue */}
                    <p className="text-sm text-gray-700 mb-3 font-semibold">
                      by {event.venue_name}
                    </p>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-md border-2 border-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="truncate font-semibold">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="font-bold text-gray-900">
                          {event.price === 0 ? "Free" : `${event.price} AZN`}
                        </span>
                      </div>
                    </div>

                    {/* RSVP Counts */}
                    <div className="flex items-center gap-4 mb-4 text-sm pb-4 border-b-2 border-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-gray-900" />
                        <span className="font-bold text-gray-900">
                          {event.interestedCount}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          interested
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-gray-900" />
                        <span className="font-bold text-gray-900">
                          {event.goingCount}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          going
                        </span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    {event.capacity && capacityPercentage !== null && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-700 mb-2 font-bold">
                          <span>Capacity</span>
                          <span>
                            {event.goingCount} / {event.capacity}
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
                          <p className="text-xs text-red-700 font-bold mt-2 bg-red-50 px-2 py-1 rounded-md border-2 border-red-300">
                            ⚠️ At capacity
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
