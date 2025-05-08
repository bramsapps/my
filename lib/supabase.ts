import { createClient } from "@supabase/supabase-js"

// Singleton pattern voor client-side Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient && typeof window !== "undefined") {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabaseClient
}

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  )
}
