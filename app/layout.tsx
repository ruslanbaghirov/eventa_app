// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { Toaster } from "react-hot-toast";

/**
 * ROOT LAYOUT
 * This wraps EVERY page in your app
 *
 * What we added:
 * - AuthProvider: Makes user auth available everywhere
 * - Toaster: Enables toast notifications (replaces alert())
 *
 * suppressHydrationWarning:
 * - Fixes hydration errors from browser extensions
 * - Safe to use, doesn't hide real errors
 */

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventHub | Discover Local Events",
  description: "Find and attend amazing local events in Azerbaijan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Auth Provider: Makes useAuth() available everywhere */}
        <AuthProvider>{children}</AuthProvider>

        {/* Toast Notifications: Shows professional notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
