// app/dashboard/events/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  X,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  Info,
  MessageCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * CREATE EVENT PAGE - WITH CAPACITY & CONTACT INFO
 *
 * What this does:
 * - Venue creates new events with all details
 * - Optional capacity limit (toggle: no limit / set limit)
 * - Contact info: WhatsApp, Email, Booking Link
 * - Image upload to Supabase Storage
 * - Live preview of event card
 * - Review modal before submitting
 *
 * New Features:
 * - Capacity toggle (venues choose if they want limit)
 * - Contact methods (how users reach organizer)
 * - Clean UI with advanced settings section
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

export default function CreateEventPage() {
  // Basic form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  // Capacity settings (NEW)
  const [hasCapacity, setHasCapacity] = useState(false);
  const [capacity, setCapacity] = useState("50");

  // Contact info (NEW)
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bookingLink, setBookingLink] = useState("");

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [venueName, setVenueName] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Get venue name and email on mount
  useEffect(() => {
    async function getVenueInfo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("venue_name, full_name, email")
          .eq("id", user.id)
          .single();

        setVenueName(profile?.venue_name || profile?.full_name || "Your Venue");

        // Pre-fill email with venue's email
        if (profile?.email && !contactEmail) {
          setContactEmail(profile.email);
        }
      }
    }
    getVenueInfo();
  }, [supabase]);

  // Handle image selection
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
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;

    setUploadingImage(true);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      setUploadingImage(false);
      return publicUrl;
    } catch (err: any) {
      console.error("❌ Image upload error:", err);
      toast.error("Failed to upload image");
      setUploadingImage(false);
      return null;
    }
  }

  function handleReviewClick(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      toast.error("Please enter event title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter event description");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!date) {
      toast.error("Please select event date");
      return;
    }
    if (!time) {
      toast.error("Please select event time");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter event location");
      return;
    }
    if (!price) {
      toast.error("Please enter ticket price (0 for free)");
      return;
    }
    if (hasCapacity && (!capacity || parseInt(capacity) <= 0)) {
      toast.error("Please enter a valid capacity");
      return;
    }

    setShowReviewModal(true);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      console.log("🔄 Starting event creation...");

      // Step 1: Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("❌ Auth error:", authError);
        throw new Error("Authentication error: " + authError.message);
      }

      if (!user) {
        throw new Error("You must be logged in to create events");
      }

      console.log("✅ User authenticated:", user.id);

      // Step 2: Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        console.log("📸 Uploading image...");
        imageUrl = await uploadImage();
        if (!imageUrl && imageFile) {
          throw new Error("Image upload failed. Please try again.");
        }
        console.log("✅ Image uploaded:", imageUrl);
      }

      // Step 3: Prepare event data
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        time,
        location: location.trim(),
        price: parseFloat(price) || 0,
        capacity: hasCapacity ? parseInt(capacity) : null,
        contact_whatsapp: contactWhatsapp.trim() || null,
        contact_email: contactEmail.trim() || null,
        booking_link: bookingLink.trim() || null,
        venue_name: venueName,
        venue_user_id: user.id,
        status: "pending",
        image_url: imageUrl,
      };

      console.log("📝 Event data to insert:", eventData);

      // Step 4: Insert event into database
      const { data: event, error: createError } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (createError) {
        console.error("❌ Supabase insert error:", createError);
        console.error("Error details:", {
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code,
        });
        throw new Error(`Database error: ${createError.message}`);
      }

      if (!event) {
        throw new Error("Event was created but no data was returned");
      }

      console.log("✅ Event created successfully:", event);

      // Success!
      toast.success("Event created successfully! Waiting for admin approval.");

      setShowReviewModal(false);

      // Redirect to events dashboard
      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("❌ Create event error:", err);
      console.error("Error type:", typeof err);
      console.error("Error keys:", Object.keys(err));

      // Extract meaningful error message
      let errorMessage = "Failed to create event. Please try again.";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.error_description) {
        errorMessage = err.error_description;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Event
              </h1>
              <p className="text-gray-600 mt-1">
                Fill in the details and see a live preview
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-4xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>💡 Pro Tip:</strong> Your event will be reviewed within 24
            hours. Use the live preview on the right to see how your event will
            look!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-4xl mx-auto">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT SIDE: FORM */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Event Details
            </h2>

            <form onSubmit={handleReviewClick} className="space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
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
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or WEBP (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                  </label>
                )}
              </div>

              {/* Event Title */}
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
                  disabled={loading}
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  placeholder="e.g., Live Jazz Night with Maria Silva"
                />
              </div>

              {/* Event Description */}
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
                  disabled={loading}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all resize-none"
                  placeholder="Describe your event in detail..."
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
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
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
                    disabled={loading}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
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
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
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
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  placeholder="e.g., Downtown, 123 Nizami Street, Baku"
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
                  disabled={loading}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 0 for free events
                </p>
              </div>

              {/* ADVANCED SETTINGS (NEW) */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors mb-4"
                >
                  <Settings className="w-4 h-4" />
                  Advanced Settings
                  <span className="text-xs text-gray-500">
                    (Capacity & Contact Info)
                  </span>
                </button>

                {showAdvancedSettings && (
                  <div className="space-y-5 bg-gray-50 rounded-lg p-5">
                    {/* CAPACITY SECTION */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Event Capacity (Optional)
                      </h3>

                      {/* Capacity Toggle */}
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
                          <p className="text-xs text-gray-600 mt-1">
                            Limit "Going" RSVPs to a specific number.
                            "Interested" will remain unlimited.
                          </p>
                        </div>
                      </div>

                      {/* Capacity Input (shown when toggled) */}
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
                            disabled={loading}
                            min="1"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                            placeholder="50"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Use this for workshops, small venues, or
                            exclusive events
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CONTACT INFO SECTION */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Contact Information (Optional)
                      </h3>
                      <p className="text-xs text-gray-600">
                        Add ways for attendees to reach you for bookings or
                        questions
                      </p>

                      {/* WhatsApp */}
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
                          disabled={loading}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                          placeholder="994501234567"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Format: 994501234567 (numbers only, with country code)
                        </p>
                      </div>

                      {/* Email */}
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
                          disabled={loading}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>

                      {/* Booking Link */}
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
                          disabled={loading}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                          placeholder="https://eventbrite.com/your-event"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to Eventbrite, iTicket.az, or your website
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Review & Create
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: LIVE PREVIEW */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Live Preview
              </h2>

              {/* Event Card Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Image */}
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">No image uploaded</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3">
                      {category}
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {title || "Event Title"}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">by {venueName}</p>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {description || "Event description will appear here..."}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {date
                          ? new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date not selected"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{time || "Time not selected"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{location || "Location not specified"}</span>
                    </div>
                    {hasCapacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Capacity: {capacity} people</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info Preview */}
                  {(contactWhatsapp || contactEmail || bookingLink) && (
                    <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Contact Methods:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {contactWhatsapp && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        )}
                        {contactEmail && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            <Mail className="w-3 h-3" />
                            Email
                          </span>
                        )}
                        {bookingLink && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            <ExternalLink className="w-3 h-3" />
                            Tickets
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-lg font-bold text-gray-900">
                      {price
                        ? parseFloat(price) === 0
                          ? "Free"
                          : `${price} AZN`
                        : "Price not set"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                This is how your event will look to users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Review Your Event
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Please review all details before submitting
              </p>
            </div>

            <div className="p-6 space-y-4">
              {imagePreview && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Image
                  </label>
                  <img
                    src={imagePreview}
                    alt="Event"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Event Title
                  </label>
                  <p className="text-gray-900">{title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">{category}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Time
                  </label>
                  <p className="text-gray-900">{time}</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900">{location}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ticket Price
                  </label>
                  <p className="text-gray-900">
                    {parseFloat(price) === 0 ? "Free" : `${price} AZN`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Capacity
                  </label>
                  <p className="text-gray-900">
                    {hasCapacity ? `${capacity} people` : "No limit"}
                  </p>
                </div>
              </div>

              {/* Contact Info Summary */}
              {(contactWhatsapp || contactEmail || bookingLink) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <div className="space-y-1 text-sm">
                    {contactWhatsapp && (
                      <p className="text-gray-900">
                        📱 WhatsApp: {contactWhatsapp}
                      </p>
                    )}
                    {contactEmail && (
                      <p className="text-gray-900">📧 Email: {contactEmail}</p>
                    )}
                    {bookingLink && (
                      <p className="text-gray-900">🔗 Booking: {bookingLink}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>⏳ Important:</strong> Your event will be submitted
                  for review. Our team typically reviews events within 24 hours.
                  You'll see the status in your dashboard.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploadingImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadingImage
                      ? "Uploading Image..."
                      : "Creating Event..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Submit
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
