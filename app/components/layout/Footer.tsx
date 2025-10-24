// app/components/layout/Footer.tsx

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function Footer() {
  return (
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
  );
}
