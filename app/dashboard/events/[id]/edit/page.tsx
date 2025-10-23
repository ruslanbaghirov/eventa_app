// app/dashboard/events/[id]/edit/page.tsx

"use client";

import { use, useState, useEffect } from "react"; // ← Added 'use' import
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Loader2,
  ArrowLeft,
  X,
  Upload,
  Eye,
  CheckCircle,
  Settings,
  Users,
  MessageCircle,
  Mail,
  ExternalLink,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * EDIT EVENT PAGE - SIMPLIFIED (NO RESTRICTIONS)
 *
 * Edit Policy:
 * - Venues can edit ANY field at ANY time
 * - Changes are transparent via "Updated X ago" badge
 * - Trust-based model
 * - Future: Email notifications when events are updated
 *
 * Next.js 15 Compatibility:
 * - Uses React.use() to unwrap params Promise
 * - Follows new async params pattern
 */

const CATEGORIES = [
  "Music",
  "Comedy",
  "Art",
  "Tech",
  "Food",
  "Sports",
  "Education",
  "Networking",
  "Other",
];

const TIME_SLOTS = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [hasCapacity, setHasCapacity] = useState(false);
  const [capacity, setCapacity] = useState("50");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bookingLink, setBookingLink] = useState("");

  // Analytics state (for display only)
  const [rsvpCount, setRsvpCount] = useState(0);
  const [interestedCount, setInterestedCount] = useState(0);
  const [goingCount, setGoingCount] = useState(0);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [requestingCancellation, setRequestingCancellation] = useState(false);

  // General state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [venueName, setVenueName] = useState("");
  const [eventStatus, setEventStatus] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadEventData();
  }, [eventId]); // ✅ Now using unwrapped eventId

  async function loadEventData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch event - using unwrapped eventId
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId) // ✅ Using unwrapped eventId
        .eq("venue_user_id", user.id)
        .single();

      if (eventError || !event) {
        toast.error("Event not found or you do not have permission to edit it");
        router.push("/dashboard/events");
        return;
      }

      // Check if event is cancelled
      if (
        event.status === "cancelled" ||
        event.cancellation_approved_by_admin
      ) {
        toast.error("Cannot edit a cancelled event");
        router.push("/dashboard/events");
        return;
      }

      // Pre-fill form
      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category);
      setDate(event.date);
      setTime(event.time);
      setLocation(event.location);
      setPrice(event.price?.toString() || "0");
      setHasCapacity(event.capacity !== null);
      setCapacity(event.capacity?.toString() || "50");
      setContactWhatsapp(event.contact_whatsapp || "");
      setContactEmail(event.contact_email || "");
      setBookingLink(event.booking_link || "");
      setCurrentImageUrl(event.image_url);
      setImagePreview(event.image_url);
      setVenueName(event.venue_name);
      setEventStatus(event.status);

      if (
        event.capacity ||
        event.contact_whatsapp ||
        event.contact_email ||
        event.booking_link
      ) {
        setShowAdvancedSettings(true);
      }

      // Get RSVP counts (for info display) - using unwrapped eventId
      const { count: interested } = await supabase
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId) // ✅ Using unwrapped eventId
        .eq("rsvp_type", "interested")
        .eq("status", "active");

      const { count: going } = await supabase
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId) // ✅ Using unwrapped eventId
        .eq("rsvp_type", "going")
        .eq("status", "active");

      setInterestedCount(interested || 0);
      setGoingCount(going || 0);
      setRsvpCount((interested || 0) + (going || 0));
    } catch (err: any) {
      console.error("Error loading event:", err);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(currentImageUrl);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return currentImageUrl;

    setUploadingImage(true);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(fileName);

      setUploadingImage(false);
      return publicUrl;
    } catch (err: any) {
      console.error("❌ Image upload error:", err);
      toast.error("Failed to upload image");
      setUploadingImage(false);
      return currentImageUrl;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (
      !title.trim() ||
      !description.trim() ||
      !category ||
      !date ||
      !time ||
      !location.trim() ||
      !price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (hasCapacity && (!capacity || parseInt(capacity) < 0)) {
      toast.error("Please enter a valid capacity");
      return;
    }

    // Check if trying to decrease capacity below current RSVPs
    if (hasCapacity && parseInt(capacity) < goingCount) {
      toast.error(
        `Cannot set capacity below current "Going" count (${goingCount})`
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      let imageUrl = currentImageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        category: category,
        date: date,
        time: time,
        location: location.trim(),
        price: parseFloat(price) || 0,
        capacity: hasCapacity ? parseInt(capacity) : null,
        image_url: imageUrl,
        contact_whatsapp: contactWhatsapp.trim() || null,
        contact_email: contactEmail.trim() || null,
        booking_link: bookingLink.trim() || null,
      };

      const { error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId); // ✅ Using unwrapped eventId

      if (updateError) throw updateError;

      toast.success("Event updated successfully!");

      // Future: Send email notifications to all RSVPs here
      if (rsvpCount > 0) {
        toast.success(`${rsvpCount} attendees will be notified of changes`, {
          duration: 4000,
        });
      }

      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("❌ Update error:", err);
      setError(err.message || "Failed to update event");
      toast.error("Failed to update event");
      setSaving(false);
    }
  }

  async function handleCancelEvent() {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setRequestingCancellation(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          cancellation_requested: true,
          cancellation_reason: cancellationReason.trim(),
          cancellation_requested_at: new Date().toISOString(),
        })
        .eq("id", eventId); // ✅ Using unwrapped eventId

      if (error) throw error;

      toast.success("Cancellation request submitted. Awaiting admin approval.");
      setShowCancelModal(false);

      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Cancel request error:", err);
      toast.error("Failed to submit cancellation request");
    } finally {
      setRequestingCancellation(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600 mt-1">Update your event details</p>
            </div>
            <Link
              href="/dashboard/events"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Info Badge - Show RSVP count if any */}
        {rsvpCount > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  This event has {rsvpCount} RSVP{rsvpCount !== 1 ? "s" : ""} (
                  {interestedCount} interested, {goingCount} going)
                </p>
                <p className="text-sm text-blue-800">
                  Changes you make will be visible immediately. Consider
                  notifying attendees of major changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-4xl mx-auto">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT SIDE: FORM */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Event Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={saving}
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={saving}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select time</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ticket Price (AZN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={saving}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Advanced Settings */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors mb-4"
                >
                  <Settings className="w-4 h-4" />
                  Advanced Settings
                </button>

                {showAdvancedSettings && (
                  <div className="space-y-5 bg-gray-50 rounded-lg p-5">
                    {/* Capacity */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Event Capacity
                      </h3>

                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="hasCapacity"
                          checked={hasCapacity}
                          onChange={(e) => setHasCapacity(e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="hasCapacity"
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Set capacity limit
                          </label>
                          {goingCount > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Current "Going" RSVPs: {goingCount}
                            </p>
                          )}
                        </div>
                      </div>

                      {hasCapacity && (
                        <div className="ml-7">
                          <label
                            htmlFor="capacity"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Maximum capacity
                          </label>
                          <input
                            type="number"
                            id="capacity"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            disabled={saving}
                            min={goingCount}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          {goingCount > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              Minimum: {goingCount} (current "Going" RSVPs)
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Contact Information
                      </h3>

                      <div>
                        <label
                          htmlFor="whatsapp"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          id="whatsapp"
                          value={contactWhatsapp}
                          onChange={(e) => setContactWhatsapp(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="994501234567"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contactEmail"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bookingLink"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          External Booking/Ticket Link
                        </label>
                        <input
                          type="url"
                          id="bookingLink"
                          value={bookingLink}
                          onChange={(e) => setBookingLink(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://eventbrite.com/your-event"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/dashboard/events"
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploadingImage ? "Uploading..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Cancel Event Button */}
              {rsvpCount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-700 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Ban className="w-5 h-5" />
                    Request Event Cancellation
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT SIDE: PREVIEW */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Preview
              </h2>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">No image</p>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {title || "Event Title"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">by {venueName}</p>
                  <p className="text-sm text-gray-700 mb-4">
                    {description || "Description..."}
                  </p>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {date || "Date"}</p>
                    <p>⏰ {time || "Time"}</p>
                    <p>📍 {location || "Location"}</p>
                    <p className="font-bold">
                      {price
                        ? parseFloat(price) === 0
                          ? "Free"
                          : `${price} AZN`
                        : "Price"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Request Event Cancellation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This requires admin approval
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Event:</strong> {title}
                  <br />
                  <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                  <br />
                  <strong>Current RSVPs:</strong> {rsvpCount}
                </p>
              </div>

              <label
                htmlFor="cancellation-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cancellation-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="e.g., Venue double-booked, Artist cancelled, Technical issues..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={requestingCancellation}
              />
              <p className="text-xs text-gray-500 mt-2">
                {cancellationReason.length}/500 characters
              </p>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                  <strong>⚠️ This will:</strong>
                  <br />
                  • Send your request to admin for approval
                  <br />• If approved, all {rsvpCount} attendee
                  {rsvpCount !== 1 ? "s" : ""} will be notified
                  <br />• Event will be marked as "CANCELLED" (visible for
                  transparency)
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                disabled={requestingCancellation}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={requestingCancellation || !cancellationReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {requestingCancellation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
