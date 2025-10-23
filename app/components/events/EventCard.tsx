// app/components/events/EventCard.tsx

import Link from "next/link";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Event } from "@/app/types";
import { format } from "date-fns";

/**
 * EventCard Component
 *
 * What it does:
 * - Displays a single event in a card format
 * - Shows image, title, venue, date, location, price, capacity
 * - Links to event detail page
 * - Responsive design (looks good on mobile and desktop)
 *
 * Where it's used:
 * - Event listing page (/events)
 * - Search results
 * - User dashboard (later)
 * - Venue dashboard (later)
 *
 * Props:
 * - event: Event object containing all event data
 *
 * Why this design:
 * - Card layout is familiar (Instagram, Eventbrite, Meetup)
 * - Visual hierarchy: image → title → details → action
 * - Progress bar shows capacity at a glance
 * - Hover effect encourages interaction
 */

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  /**
   * Format the date to human-readable format
   * Input: "2024-11-15"
   * Output: "November 15, 2024"
   *
   * Why date-fns: Lightweight, simple, great TypeScript support
   */
  const formattedDate = format(new Date(event.date), "MMMM d, yyyy");

  /**
   * Format the time to 12-hour format with AM/PM
   * Input: "20:00:00"
   * Output: "8:00 PM"
   *
   * Why: More user-friendly than 24-hour format
   */
  const formattedTime = format(new Date(`2000-01-01T${event.time}`), "h:mm a");

  /**
   * Calculate how full the event is (as percentage)
   * Used for progress bar and "Almost Full" badge
   *
   * Example: 42 attendees / 150 capacity = 28%
   */
  const capacityPercentage = (event.attendees_count / event.capacity) * 100;
  const isAlmostFull = capacityPercentage > 80;

  return (
    /**
     * Entire card is a link to event detail page
     * Next.js Link component = no page reload, instant navigation
     * href="/events/[id]" = dynamic route (we'll create this next)
     */
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        {/* ============================================ */}
        {/* EVENT IMAGE */}
        {/* ============================================ */}
        <div className="relative h-48 bg-gray-200">
          {event.image_url ? (
            // Show event image if available
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            // Fallback: Nice gradient with calendar icon if no image
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
              <Calendar className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          {/* Category Badge (top right) */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 shadow-sm">
              {event.category}
            </span>
          </div>

          {/* Almost Full Badge (top left) - only shows if >80% capacity */}
          {isAlmostFull && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                Almost Full!
              </span>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* EVENT CONTENT */}
        {/* ============================================ */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Event Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Venue Name (in blue to indicate it's the organizer) */}
          <p className="text-sm text-blue-600 font-medium mb-3">
            {event.venue_name}
          </p>

          {/* Event Description (truncated to 2 lines) */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>

          {/* ============================================ */}
          {/* EVENT DETAILS GRID */}
          {/* ============================================ */}
          <div className="space-y-2 mb-4">
            {/* Date & Time */}
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {/* Attendees Count */}
            <div className="flex items-center text-sm text-gray-700">
              <Users className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>
                {event.attendees_count} / {event.capacity} attending
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center text-sm font-semibold text-gray-900">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span>
                {event.price === 0
                  ? "Free Event"
                  : `$${event.price.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* ============================================ */}
          {/* CAPACITY PROGRESS BAR */}
          {/* ============================================ */}
          <div className="mt-auto">
            {/* Progress bar label */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Capacity</span>
              <span>{Math.round(capacityPercentage)}% Full</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAlmostFull ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * ============================================
 * KEY CONCEPTS IN THIS COMPONENT:
 * ============================================
 *
 * 1. TYPESCRIPT INTERFACE (EventCardProps):
 *    - Defines what props this component expects
 *    - TypeScript will error if we forget to pass 'event'
 *    - Gives us autocomplete in VS Code
 *
 * 2. DATE-FNS FORMAT:
 *    - format() converts dates to readable strings
 *    - 'MMMM d, yyyy' = "November 15, 2024"
 *    - 'h:mm a' = "8:00 PM"
 *
 * 3. CONDITIONAL RENDERING:
 *    - {event.image_url ? <img /> : <div />}
 *    - Shows image OR fallback gradient
 *
 * 4. TAILWIND CLASSES:
 *    - line-clamp-2 = Show max 2 lines, add "..."
 *    - hover:shadow-xl = Bigger shadow on hover
 *    - flex flex-col = Stack items vertically
 *    - mt-auto = Push to bottom (progress bar)
 *
 * 5. NEXT.JS LINK:
 *    - <Link href="/events/123"> wraps the card
 *    - No page reload = instant navigation
 *    - SEO-friendly (search engines can follow)
 *
 * 6. LUCIDE ICONS:
 *    - <Calendar className="w-4 h-4" />
 *    - Consistent icon design
 *    - Customizable with Tailwind
 */
