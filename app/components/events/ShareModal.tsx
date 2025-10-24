// app/components/events/ShareModal.tsx

"use client";

import { useState } from "react";
import { X, Instagram, MessageCircle, Link as LinkIcon } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image_url?: string | null;
  };
}

export default function ShareModal({ isOpen, onClose, event }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const eventUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Join me at ${event.title}! ${eventUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDownloadCard = () => {
    // This would trigger the download of the Instagram story card
    // For now, we'll just show an alert
    alert("Card download feature coming soon!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Share Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Options - Icons Row */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">
              Share Event
            </h3>
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Instagram Story */}
              <button
                onClick={handleDownloadCard}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Instagram className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900">
                  Instagram Story
                </span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900">
                  WhatsApp
                </span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <LinkIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900">
                  {copied ? "Link Copied!" : "Copy Link"}
                </span>
              </button>
            </div>
          </div>

          {/* Instagram Story Card Preview */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">
              Story Preview
            </h3>
            <div className="relative">
              {/* Instagram Story Template */}
              <div className="aspect-[9/16] max-w-[300px] mx-auto bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-lg overflow-hidden shadow-2xl relative">
                {/* Background Image (if available) */}
                {event.image_url && (
                  <div className="absolute inset-0">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
                  </div>
                )}
                
                <div className="relative h-full flex flex-col justify-between p-6 text-white">
                  {/* Top Section */}
                  <div>
                    <div className="inline-block px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-bold mb-4">
                      {event.category}
                    </div>
                  </div>

                  {/* Bottom Section - Event Info */}
                  <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-lg p-4 space-y-2">
                    <h3 className="text-xl font-bold leading-tight">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{event.time}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate">{event.location}</span>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white border-opacity-30">
                      <p className="text-xs font-bold">EventHub</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
