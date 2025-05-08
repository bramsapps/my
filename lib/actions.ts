"use server"

import { getSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import type { Photo } from "@/lib/types"

// Dummy data voor wanneer de database niet beschikbaar is
const dummyPhoto: Photo = {
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

export async function getCurrentPhoto(): Promise<Photo | null> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("photos").select("*").eq("is_current", true).single()

    if (error) {
      console.error("Error fetching current photo:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getCurrentPhoto:", error)
    return null
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("photos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllPhotos:", error)
    return []
  }
}

export async function getPhotoById(id: number): Promise<Photo | null> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("photos").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching photo with id ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Error in getPhotoById for id ${id}:`, error)
    return null
  }
}

export async function uploadPhoto(formData: FormData): Promise<{ data?: any; error?: string }> {
  const file = formData.get("photo") as File | null

  if (!file) {
    return { error: "Geen bestand ontvangen" }
  }

  try {
    const supabase = getSupabaseClient()

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

    // Controleer of de bucket bestaat, zo niet, dan maken we deze aan
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const photosBucketExists = buckets?.some((bucket) => bucket.name === "photos")

      if (!photosBucketExists) {
        await supabase.storage.createBucket("photos", {
          public: true,
        })
      }
    } catch (bucketError) {
      console.error("Bucket check error:", bucketError)
      // Ga door, zelfs als de bucket check mislukt
    }

    const { data: uploadData, error: uploadError } = await supabase.storage.from("photos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error details:", uploadError)
      return { error: `Upload error: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(fileName)

    const { data: existingPhotos } = await supabase.from("photos").select("id").eq("is_current", true)

    if (existingPhotos && existingPhotos.length > 0) {
      const { error: updateError } = await supabase.from("photos").update({ is_current: false }).eq("is_current", true)

      if (updateError) {
        console.error("Update error details:", updateError)
        return { error: `Database update error: ${updateError.message}` }
      }
    }

    const { data, error } = await supabase
      .from("photos")
      .insert([
        {
          image_url: publicUrl,
          is_current: true,
        },
      ])
      .select()

    if (error) {
      console.error("Insert error details:", error)
      return { error: `Database insert error: ${error.message}` }
    }

    revalidatePath("/")
    revalidatePath("/archief")

    return { data }
  } catch (error: any) {
    console.error("Server error:", error)
    return { error: error.message || "Er is een onverwachte fout opgetreden" }
  }
}
