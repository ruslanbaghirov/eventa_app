// app/lib/auth-context.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * AUTH CONTEXT
 *
 * Provides global access to:
 * - Current user
 * - Loading state
 * - Sign out function
 *
 * Why we need this:
 * - Avoids prop drilling
 * - Single source of truth for auth state
 * - Easy to check if user is logged in from any component
 *
 * Usage:
 * const { user, loading, signOut } = useAuth()
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
