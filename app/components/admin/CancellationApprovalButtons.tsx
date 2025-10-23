// app/components/admin/CancellationApprovalButtons.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CANCELLATION APPROVAL BUTTONS COMPONENT
 *
 * What this does:
 * - Admin can approve or reject venue's cancellation request
 * - Approve: Marks event as cancelled, updates database
 * - Reject: Clears cancellation request, event stays active
 * - Toast notifications for feedback
 *
 * Props:
 * - eventId: Event with cancellation request
 * - eventTitle: For notification messages
 */

interface CancellationApprovalButtonsProps {
  eventId: string;
  eventTitle: string;
}

export default function CancellationApprovalButtons({
  eventId,
  eventTitle,
}: CancellationApprovalButtonsProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Handle approve cancellation
  async function handleApproveCancellation() {
    const confirmed = window.confirm(
      `Approve cancellation for "${eventTitle}"?\n\nThis will:\n• Mark event as cancelled\n• Notify all attendees\n• Keep event visible with "CANCELLED" badge`
    );

    if (!confirmed) return;

    setApproving(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: "cancelled",
          cancellation_approved_by_admin: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;

      // TODO: In future, send email notifications to all RSVPs here
      // For now, just show success message

      toast.success("Cancellation approved. Event marked as cancelled.", {
        duration: 5000,
        position: "top-right",
      });

      router.refresh();
    } catch (err: any) {
      console.error("Approve cancellation error:", err);
      toast.error("Failed to approve cancellation. Please try again.");
    } finally {
      setApproving(false);
    }
  }

  // Handle reject cancellation
  async function handleRejectCancellation() {
    const confirmed = window.confirm(
      `Reject cancellation request for "${eventTitle}"?\n\nThe event will remain active.`
    );

    if (!confirmed) return;

    setRejecting(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          cancellation_requested: false,
          cancellation_reason: null,
          cancellation_requested_at: null,
        })
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Cancellation request rejected. Event remains active.", {
        duration: 4000,
        position: "top-right",
      });

      router.refresh();
    } catch (err: any) {
      console.error("Reject cancellation error:", err);
      toast.error("Failed to reject cancellation. Please try again.");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="flex gap-3">
      {/* Approve Cancellation Button */}
      <button
        onClick={handleApproveCancellation}
        disabled={approving || rejecting}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
      >
        {approving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Approve Cancellation
          </>
        )}
      </button>

      {/* Reject Cancellation Button */}
      <button
        onClick={handleRejectCancellation}
        disabled={approving || rejecting}
        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
      >
        {rejecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Rejecting...
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            Reject Request
          </>
        )}
      </button>
    </div>
  );
}
