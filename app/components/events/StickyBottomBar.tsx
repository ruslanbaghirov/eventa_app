// app/components/events/StickyBottomBar.tsx

"use client";

import { useState } from "react";
import { Calendar, Clock, Star, Check, Share2 } from "lucide-react";
import RSVPButton from "./RSVPButton";
import ShareModal from "./ShareModal";

interface StickyBottomBarProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image_url?: string | null;
  };
  interestedCount: number;
  goingCount: number;
  currentRSVP?: "interested" | "going";
  capacity: number | null;
}

export default function StickyBottomBar({
  event,
  interestedCount,
  goingCount,
  currentRSVP,
  capacity,
}: StickyBottomBarProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white border-4 border-gray-900 shadow-2xl rounded-lg">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Event Info */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                  {event.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </span>
                </div>
              </div>

              {/* RSVP Tags */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md border-2 border-gray-400">
                  <Star className="w-4 h-4 text-gray-900" />
                  <span className="font-bold text-gray-900">{interestedCount}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md border-2 border-gray-400">
                  <Check className="w-4 h-4 text-gray-900" />
                  <span className="font-bold text-gray-900">{goingCount}</span>
                </div>
              </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 bg-white rounded-md border-2 border-gray-400 hover:border-gray-900 transition-all font-bold text-gray-900 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Share Modal */}
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              event={event}
            />
          </div>              {/* RSVP Buttons */}
              <div className="w-full md:w-auto md:min-w-[400px]">
                <RSVPButton
                  eventId={event.id}
                  eventTitle={event.title}
                  currentRSVP={currentRSVP}
                  capacity={capacity}
                  currentGoingCount={goingCount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
