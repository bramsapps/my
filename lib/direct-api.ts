// Direct API calls zonder Supabase SDK
// Dit is een alternatieve implementatie die geen gebruik maakt van de Supabase SDK

import type { Photo } from "@/lib/types"

// Basis URL voor Supabase API
const getBaseUrl = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  return `${url}/rest/v1`
}

// API key voor Supabase
const getApiKey = () => {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Veilige fetch functie die nooit faalt
const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    return await fetch(url, options)
  } catch (error) {
    console.error("Fetch error:", error)
    // Return een mock response bij een fetch error
    return new Response(JSON.stringify({ error: "Netwerkfout" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Haal de huidige foto op
export const fetchCurrentPhoto = async (): Promise<Photo | null> => {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  if (!baseUrl || !apiKey) {
    console.error("Supabase configuratie ontbreekt")
    return null
  }

  try {
    const response = await safeFetch(`${baseUrl}/photos?is_current=eq.true&limit=1`, {
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Prefer: "return=representation",
      },
    })

    if (!response.ok) {
      console.error("Error fetching current photo:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("Error in fetchCurrentPhoto:", error)
    return null
  }
}

// Haal alle foto's op
export const fetchAllPhotos = async (): Promise<Photo[]> => {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  if (!baseUrl || !apiKey) {
    console.error("Supabase configuratie ontbreekt")
    return []
  }

  try {
    const response = await safeFetch(`${baseUrl}/photos?order=created_at.desc`, {
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.error("Error fetching photos:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data || []
  } catch (error) {
    console.error("Error in fetchAllPhotos:", error)
    return []
  }
}

// Haal een specifieke foto op
export const fetchPhotoById = async (id: number): Promise<Photo | null> => {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  if (!baseUrl || !apiKey) {
    console.error("Supabase configuratie ontbreekt")
    return null
  }

  try {
    const response = await safeFetch(`${baseUrl}/photos?id=eq.${id}&limit=1`, {
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.error("Error fetching photo:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error(`Error in fetchPhotoById for id ${id}:`, error)
    return null
  }
}

// Dummy data voor wanneer de database niet beschikbaar is
export const dummyPhoto: Photo = {
  id: 1,
  image_url: "/vast-mountain-valley.png",
  created_at: new Date().toISOString(),
  is_current: true,
  location_lat: null,
  location_lng: null,
  location_name: "Demo Locatie",
  description: "Dit is een voorbeeld foto omdat er geen verbinding kon worden gemaakt met de database.",
  photo_date: new Date().toISOString(),
}

export const dummyPhotos: Photo[] = [
  dummyPhoto,
  {
    id: 2,
    image_url: "/vast-mountain-valley.png",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dag geleden
    is_current: false,
    location_lat: null,
    location_lng: null,
    location_name: "Strand Demo",
    description: "Nog een voorbeeld foto voor de archief pagina.",
    photo_date: new Date(Date.now() - 86400000).toISOString(),
  },
]
