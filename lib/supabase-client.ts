"use client"

import { createClient } from "@supabase/supabase-js"

// Singleton pattern voor client-side Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient && typeof window !== "undefined") {
    try {
      supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            // Voeg extra headers toe om te helpen met RLS-beleid
            "x-client-info": "twee-stoelen-app",
          },
        },
      })
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return null
    }
  }
  return supabaseClient
}
