// app/signup/page.tsx

"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  UserCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * PUBLIC USER SIGNUP PAGE
 * Route: /signup
 *
 * Professional version with:
 * - Beautiful UI with icons and animations
 * - Proper error handling
 * - Success screen with smooth transition
 * - Toast notifications
 * - Accessible form inputs
 *
 * What this does:
 * 1. User fills out form (name, email, password)
 * 2. Creates Supabase auth account
 * 3. Shows success screen with animation
 * 4. Auto-redirects to login after 3 seconds
 */

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("fullName") as string;

    // Save name for success message
    setUserName(name);

    console.log("🚀 Starting signup for:", email);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      console.error("❌ Signup error:", signUpError);

      // User-friendly error messages
      let errorMessage = signUpError.message;

      if (signUpError.message.includes("already registered")) {
        errorMessage =
          "This email is already registered. Try logging in instead.";
      } else if (signUpError.message.includes("Password")) {
        errorMessage = "Password must be at least 6 characters.";
      } else if (signUpError.message.includes("rate limit")) {
        errorMessage = "Too many attempts. Please wait a moment and try again.";
      }

      setError(errorMessage);
      setLoading(false);
      toast.error("Signup failed");
      return;
    }

    // Success!
    console.log("✅ Signup successful!");
    setDone(true);
    setLoading(false);
    toast.success(`Welcome ${name}! Account created successfully!`);

    // Redirect after 3 seconds
    setTimeout(() => {
      console.log("🚀 Redirecting to login...");
      router.push("/login");
    }, 3000);
  }

  // ============================================
  // SUCCESS SCREEN
  // ============================================
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Simple Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </Link>
          </div>
        </header>

        {/* Success Content */}
        <div className="flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            {/* Animated Success Icon */}
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome, {userName}! 🎉
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              Your account has been created successfully!
            </p>
            <p className="text-gray-600 mb-8">
              You can now log in and start discovering amazing local events.
            </p>

            {/* Redirect Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-blue-900">
                  Redirecting to login page...
                </p>
              </div>
              <p className="text-xs text-blue-700">
                You'll be redirected automatically in a moment
              </p>
            </div>

            {/* Manual Link */}
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

  // ============================================
  // SIGNUP FORM
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
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

      {/* Signup Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Join and discover amazing local events
            </p>
          </div>

          {/* Error Message */}
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
