// app/lib/supabase-server.ts

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * SERVER CLIENT (Server Components & API Routes)
 *
 * This client ONLY works in Server Components
 * Use this when:
 * - You're in a Server Component (no 'use client')
 * - You're in an API Route
 * - You need to check authentication server-side
 * - You're fetching data before rendering
 *
 * Why it's different:
 * - Has access to cookies (for session management)
 * - Can verify user authentication securely
 * - Doesn't expose sensitive data to browser
 *
 * Example:
 * // Server Component (no 'use client')
 * import { createServerClient } from '@/app/lib/supabase-server'
 *
 * async function MyPage() {
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   return <div>Welcome {user?.email}</div>
 * }
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
