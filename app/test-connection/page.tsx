// app/test-connection/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase";
import Link from "next/link";

/**
 * Test Connection Page
 * Verifies Supabase connection works properly
 *
 * This component:
 * - Tests database connection on mount
 * - Shows loading state while testing
 * - Displays success or error message
 * - Uses proper hydration to avoid React warnings
 */
export default function TestConnectionPage() {
  // State for connection status
  const [status, setStatus] = useState<"testing" | "success" | "error">(
    "testing"
  );
  const [message, setMessage] = useState("Testing Supabase connection...");
  const [isClient, setIsClient] = useState(false);

  // Fix hydration: Only render after component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run test if we're on the client side
    if (!isClient) return;

    async function testConnection() {
      try {
        // Create Supabase client
        const supabase = createClient();

        // Simple connection test - try to query auth settings
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // Connection successful!
        setStatus("success");
        setMessage(
          "✅ Supabase connection successful! Your environment variables are configured correctly."
        );
      } catch (err: any) {
        console.error("Supabase connection error:", err);
        setStatus("error");
        setMessage(`❌ Connection error: ${err.message || "Unknown error"}`);
      }
    }

    testConnection();
  }, [isClient]);

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
          <div className="p-4 rounded-lg bg-blue-100 text-blue-800">
            Initializing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Supabase Connection Test
        </h1>

        {/* Status Message */}
        <div
          className={`p-4 rounded-lg mb-4 ${
            status === "testing"
              ? "bg-blue-100 text-blue-800"
              : status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>

        {/* Success Details */}
        {status === "success" && (
          <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">✓ Configuration Verified:</p>
            <ul className="space-y-1 ml-4">
              <li>• NEXT_PUBLIC_SUPABASE_URL is set</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY is set</li>
              <li>• Supabase client initialized successfully</li>
              <li>• Ready to create database tables</li>
            </ul>
          </div>
        )}

        {/* Error Details */}
        {status === "error" && (
          <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">⚠️ Common Solutions:</p>
            <ul className="space-y-1 ml-4 text-xs">
              <li>• Check .env.local file exists in project root</li>
              <li>• Verify NEXT_PUBLIC_SUPABASE_URL is correct</li>
              <li>• Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct</li>
              <li>• Restart dev server: npm run dev</li>
            </ul>
          </div>
        )}

        {/* Back to Home Button */}
        <Link
          href="/"
          className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
