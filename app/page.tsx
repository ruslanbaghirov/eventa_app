// app/page.tsx

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

/**
 * HOMEPAGE
 * Route: /
 *
 * What this page shows:
 * - Hero section with value proposition
 * - Features grid (3 cards)
 * - Header with Login/Sign Up buttons
 * - Footer with "Partner with Us" link (hidden venue signup)
 *
 * Marketing strategy:
 * - Public users: Clear CTA to browse events and sign up
 * - Venues: Subtle "Partner with Us" link in footer
 * - Clean, professional design
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* ============================================ */}
      {/* HEADER WITH AUTH BUTTONS */}
      {/* ============================================ */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 py-20 text-center flex-1">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Discover Amazing Local Events
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Find concerts, workshops, meetups, and more happening near you.
          Connect with your community through unforgettable experiences.
        </p>

        <Link
          href="/events"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Browse Events
        </Link>
      </div>

      {/* ============================================ */}
      {/* FEATURES GRID */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1: Discover Events */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Discover Events
            </h3>
            <p className="text-gray-600 text-center">
              Browse through a curated selection of local events happening in
              your area
            </p>
          </div>

          {/* Feature 2: Find Nearby */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Find Nearby
            </h3>
            <p className="text-gray-600 text-center">
              Explore events at restaurants, cafes, and venues close to you
            </p>
          </div>

          {/* Feature 3: RSVP & Attend */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              RSVP & Attend
            </h3>
            <p className="text-gray-600 text-center">
              Reserve your spot and never miss out on exciting experiences
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FOOTER WITH VENUE SIGNUP LINK */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="font-bold">EventHub</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/events"
                className="hover:text-blue-400 transition-colors"
              >
                Browse Events
              </Link>
              <Link
                href="/signup/venue"
                className="hover:text-blue-400 transition-colors"
              >
                Partner with Us
              </Link>
              <a
                href="mailto:hello@eventhub.az"
                className="hover:text-blue-400 transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © 2024 EventHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Page Metadata
 */
export const metadata = {
  title: "EventHub | Discover Local Events in Azerbaijan",
  description:
    "Find and attend amazing local events near you. Concerts, workshops, meetups, and more.",
};
