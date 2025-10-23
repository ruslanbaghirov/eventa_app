// app/components/admin/ApproveRejectButtons.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * APPROVE/REJECT BUTTONS COMPONENT (REDESIGNED)
 *
 * What this does:
 * - Admin can approve or reject events
 * - Professional toast notifications (no browser alerts!)
 * - Loading states during actions
 * - Rejection reason modal
 * - Smooth animations
 *
 * Why redesigned:
 * - Browser alerts are unprofessional
 * - Toast notifications are modern and non-intrusive
 * - Better user experience
 * - More control over styling
 */

interface ApproveRejectButtonsProps {
  eventId: string;
}

export default function ApproveRejectButtons({
  eventId,
}: ApproveRejectButtonsProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Handle approve event
  async function handleApprove() {
    setApproving(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: "approved",
          rejection_reason: null, // Clear any previous rejection reason
        })
        .eq("id", eventId);

      if (error) throw error;

      // Success toast
      toast.success("Event approved successfully! 🎉", {
        duration: 4000,
        position: "top-right",
      });

      // Refresh the page to update the list
      router.refresh();
    } catch (err: any) {
      console.error("Approve error:", err);
      toast.error("Failed to approve event. Please try again.");
    } finally {
      setApproving(false);
    }
  }

  // Handle reject event (opens modal)
  function handleRejectClick() {
    setShowRejectModal(true);
  }

  // Handle reject submission
  async function handleRejectSubmit() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setRejecting(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
        })
        .eq("id", eventId);

      if (error) throw error;

      // Success toast
      toast.success("Event rejected. Venue will be notified.", {
        duration: 4000,
        position: "top-right",
      });

      // Close modal and refresh
      setShowRejectModal(false);
      router.refresh();
    } catch (err: any) {
      console.error("Reject error:", err);
      toast.error("Failed to reject event. Please try again.");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Approve Button */}
        <button
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          {approving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Approve
            </>
          )}
        </button>

        {/* Reject Button */}
        <button
          onClick={handleRejectClick}
          disabled={approving || rejecting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          {rejecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Reject
            </>
          )}
        </button>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Reject Event
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Please provide a reason for rejection
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="e.g., Event description is inappropriate, Invalid location, Missing required information..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={rejecting}
              />
              <p className="text-xs text-gray-500 mt-2">
                {rejectionReason.length}/500 characters
              </p>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> The venue will receive an email
                  notification with this reason. Please be professional and
                  constructive.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                disabled={rejecting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejecting || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {rejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
