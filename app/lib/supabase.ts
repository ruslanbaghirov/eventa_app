// app/lib/supabase.ts

import { createBrowserClient } from "@supabase/ssr";

/**
 * BROWSER CLIENT (Client Components)
 *
 * This client ONLY works in Client Components
 * Use this when:
 * - You're in a Client Component (has 'use client' at top)
 * - You need to handle user interactions (login, signup, logout)
 * - You're using React hooks (useState, useEffect)
 *
 * Example:
 * 'use client'
 * import { createClient } from '@/app/lib/supabase'
 *
 * const supabase = createClient()
 * await supabase.from('events').select()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
