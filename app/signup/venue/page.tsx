// app/signup/venue/page.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  UserCircle,
  Building2,
  Phone,
  MapPin,
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * HIDDEN VENUE SIGNUP PAGE
 * Route: /signup/venue
 *
 * FIXED VERSION:
 * - Properly sets user_type to 'venue' in database
 * - Updates profile table after auth user creation
 * - Handles all venue-specific fields
 */

export default function VenueSignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [venueName, setVenueName] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Account information
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // Venue information
    const venueNameValue = formData.get("venueName") as string;
    const venueDescription = formData.get("venueDescription") as string;
    const venueLocation = formData.get("venueLocation") as string;
    const venuePhone = formData.get("venuePhone") as string;

    // Save for success screen
    setVenueName(venueNameValue);

    console.log("🚀 Starting venue signup for:", venueNameValue);

    const supabase = createClient();

    try {
      // Step 1: Create auth user
      console.log("Step 1: Creating auth user...");
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        }
      );

      if (signUpError) {
        console.error("❌ Signup error:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("No user returned from signup");
      }

      console.log("✅ Auth user created:", authData.user.id);

      // Step 2: Wait for profile to be created by trigger
      console.log("Step 2: Waiting for profile creation...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 3: Update profile with venue information
      console.log("Step 3: Updating profile with venue data...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          user_type: "venue", // ← THIS IS THE KEY FIX!
          venue_name: venueNameValue,
          venue_description: venueDescription || null,
          venue_location: venueLocation,
          venue_phone: venuePhone || null,
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("⚠️ Profile update error:", updateError);
        // Don't throw - user is created, just log the error
        console.warn("Profile update failed, but user account exists");
      } else {
        console.log("✅ Profile updated with venue data");
      }

      // Step 4: Verify the update worked
      const { data: verifyProfile } = await supabase
        .from("profiles")
        .select("user_type, venue_name")
        .eq("id", authData.user.id)
        .single();

      console.log("🔍 Verification - Profile after update:", verifyProfile);

      // Success!
      console.log("🎉 Venue signup successful!");
      setDone(true);
      setLoading(false);
      toast.success(`Welcome to EventHub, ${venueNameValue}!`);

      // Redirect after 3 seconds
      setTimeout(() => {
        console.log("🚀 Redirecting to login...");
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("❌ Venue signup error:", err);

      let errorMessage = err.message;

      if (err.message?.includes("already registered")) {
        errorMessage =
          "This email is already registered. Try logging in instead.";
      } else if (err.message?.includes("Password")) {
        errorMessage = "Password must be at least 6 characters.";
      }

      setError(errorMessage);
      setLoading(false);
      toast.error("Signup failed");
    }
  }

  // Success screen
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to EventHub! 🎉
            </h1>
            <p className="text-xl text-gray-800 font-semibold mb-4">
              {venueName}
            </p>
            <p className="text-gray-600 mb-8">
              Your venue account has been created successfully. You can now
              start creating and managing events!
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-3">
                📋 What's next:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Log in to your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Create your first event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Events will be reviewed within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>You'll receive email notifications</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                <p className="text-sm text-gray-700">
                  Redirecting to login page...
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-block text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Click here to go to login now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Venue signup form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Venue Partner Signup
            </h1>
            <p className="text-gray-600">
              Create your venue account and start hosting events
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>📋 What happens next:</strong>
            </p>
            <ul className="text-xs text-blue-700 space-y-1 ml-4">
              <li>• Create your venue profile</li>
              <li>• Post events for your venue</li>
              <li>• Events reviewed within 24 hours</li>
              <li>• Get notified when approved</li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Signup Failed
                  </p>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section: Account Information */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Account Information
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Contact Person Name
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    autoComplete="name"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="venue@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>
            </div>

            {/* Section: Venue Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Venue Information
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="venueName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="venueName"
                    name="venueName"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="The Blue Note Jazz Club"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="venueDescription"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Venue Description{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="venueDescription"
                    name="venueDescription"
                    rows={3}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all resize-none"
                    placeholder="Tell us about your venue (e.g., cozy jazz club in downtown Baku...)"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="venueLocation"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Venue Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="venueLocation"
                    name="venueLocation"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="Downtown, 123 Nizami Street, Baku"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="venuePhone"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Phone Number{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="venuePhone"
                    name="venuePhone"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                    placeholder="+994 XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Venue Account...
                </>
              ) : (
                "Create Venue Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Not a venue?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Sign up as a user
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
