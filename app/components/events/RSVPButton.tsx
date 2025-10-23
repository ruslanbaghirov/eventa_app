// components/events/RSVPButton.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Star, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * RSVP BUTTON COMPONENT
 *
 * What this does:
 * - Shows [Interested] and [Going] buttons
 * - Handles RSVP creation/updates/cancellation
 * - Shows current RSVP state
 * - Checks capacity before allowing "Going" RSVP
 * - Redirects to login if not authenticated
 *
 * Props:
 * - eventId: ID of the event
 * - eventTitle: Title for toast notifications
 * - currentRSVP: User's current RSVP ('interested' | 'going' | undefined)
 * - capacity: Event capacity (null if unlimited)
 * - currentGoingCount: Current number of "Going" RSVPs
 */

interface RSVPButtonProps {
  eventId: string;
  eventTitle: string;
  currentRSVP?: "interested" | "going"; // ← Made optional with '?'
  capacity: number | null;
  currentGoingCount: number;
}

export default function RSVPButton({
  eventId,
  eventTitle,
  currentRSVP,
  capacity,
  currentGoingCount,
}: RSVPButtonProps) {
  const [rsvpType, setRsvpType] = useState<"interested" | "going" | null>(
    currentRSVP || null
  );
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleRSVP(type: "interested" | "going") {
    setLoading(true);

    try {
      // Check if user is logged in
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // Redirect to login with return URL
        toast.error("Please login to RSVP");
        router.push(`/login?redirect=/events/${eventId}`);
        return;
      }

      // Check capacity for "Going" RSVP
      if (
        type === "going" &&
        capacity !== null &&
        currentGoingCount >= capacity
      ) {
        toast.error(
          'Sorry, this event is at full capacity for "Going" RSVPs. Try "Interested" instead!'
        );
        setLoading(false);
        return;
      }

      // If clicking the same button, cancel RSVP
      if (rsvpType === type) {
        const { error } = await supabase
          .from("rsvps")
          .update({ status: "cancelled" })
          .eq("user_id", user.id)
          .eq("event_id", eventId);

        if (error) throw error;

        setRsvpType(null);
        toast.success("RSVP cancelled");
        router.refresh();
        return;
      }

      // Check if user already has an RSVP
      const { data: existingRSVP, error: fetchError } = await supabase
        .from("rsvps")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .eq("status", "active")
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingRSVP) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from("rsvps")
          .update({ rsvp_type: type })
          .eq("id", existingRSVP.id);

        if (updateError) throw updateError;

        setRsvpType(type);
        toast.success(
          `Changed to "${type === "interested" ? "Interested" : "Going"}"`
        );
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase.from("rsvps").insert({
          user_id: user.id,
          event_id: eventId,
          rsvp_type: type,
          status: "active",
        });

        if (insertError) throw insertError;

        setRsvpType(type);
        toast.success(
          `Marked as "${type === "interested" ? "Interested" : "Going"}"!`
        );
      }

      router.refresh();
    } catch (err: any) {
      console.error("RSVP error:", err);
      toast.error("Failed to update RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Check if at capacity for "Going"
  const isAtCapacity = capacity !== null && currentGoingCount >= capacity;

  return (
    <div className="flex gap-3">
      {/* Interested Button */}
      <button
        onClick={() => handleRSVP("interested")}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          rsvpType === "interested"
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-white hover:bg-yellow-50 text-gray-700 border-2 border-gray-300 hover:border-yellow-400"
        }`}
      >
        {loading && rsvpType !== "going" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Star
              className={`w-5 h-5 ${
                rsvpType === "interested" ? "fill-current" : ""
              }`}
            />
            {rsvpType === "interested" ? "✓ Interested" : "Interested"}
          </>
        )}
      </button>

      {/* Going Button */}
      <button
        onClick={() => handleRSVP("going")}
        disabled={loading || (isAtCapacity && rsvpType !== "going")}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          rsvpType === "going"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : isAtCapacity
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-white hover:bg-green-50 text-gray-700 border-2 border-gray-300 hover:border-green-400"
        }`}
      >
        {loading && rsvpType !== "interested" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Check
              className={`w-5 h-5 ${
                rsvpType === "going" ? "fill-current" : ""
              }`}
            />
            {rsvpType === "going"
              ? "✓ Going"
              : isAtCapacity
              ? "At Capacity"
              : "Going"}
          </>
        )}
      </button>
    </div>
  );
}
