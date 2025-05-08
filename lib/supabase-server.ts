import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  try {
    // Controleer of de omgevingsvariabelen zijn ingesteld
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL of API sleutel ontbreekt. Controleer je omgevingsvariabelen.")
      throw new Error("Supabase configuratie ontbreekt")
    }

    // Maak een nieuwe client aan met de juiste configuratie
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.error("Fout bij het maken van Supabase client:", error)
    throw new Error("Kon geen verbinding maken met Supabase")
  }
}

// Fallback functie die een dummy client retourneert als de echte client niet kan worden gemaakt
export const createFallbackClient = () => {
  console.warn("Gebruik fallback Supabase client")

  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
        order: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: async () => ({ data: null, error: null }),
      }),
      update: () => ({
        eq: () => ({
          select: async () => ({ data: null, error: null }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
        neq: async () => ({ data: null, error: null }),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
        remove: async () => ({ data: null, error: null }),
        list: async () => ({ data: [], error: null }),
      }),
      listBuckets: async () => ({ data: [], error: null }),
      createBucket: async () => ({ data: null, error: null }),
    },
  }
}

// Veilige versie die nooit faalt
export const getSupabaseClient = () => {
  try {
    return createServerSupabaseClient()
  } catch (error) {
    console.error("Fallback naar dummy client vanwege fout:", error)
    return createFallbackClient()
  }
}
