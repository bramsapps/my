"use server"

import { revalidatePath } from "next/cache"
import type { Photo } from "@/lib/types"
import { fetchCurrentPhoto, fetchAllPhotos, fetchPhotoById, dummyPhoto, dummyPhotos } from "@/lib/direct-api"

export async function getCurrentPhoto(): Promise<Photo | null> {
  try {
    // Probeer de huidige foto op te halen via de directe API
    const photo = await fetchCurrentPhoto()

    // Als er geen foto is, gebruik de dummy foto
    if (!photo) {
      console.log("Geen huidige foto gevonden, gebruik dummy foto")
      return dummyPhoto
    }

    return photo
  } catch (error) {
    console.error("Error in getCurrentPhoto:", error)
    // Bij een fout, gebruik de dummy foto
    return dummyPhoto
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    // Probeer alle foto's op te halen via de directe API
    const photos = await fetchAllPhotos()

    // Als er geen foto's zijn, gebruik de dummy foto's
    if (!photos || photos.length === 0) {
      console.log("Geen foto's gevonden, gebruik dummy foto's")
      return dummyPhotos
    }

    return photos
  } catch (error) {
    console.error("Error in getAllPhotos:", error)
    // Bij een fout, gebruik de dummy foto's
    return dummyPhotos
  }
}

export async function getPhotoById(id: number): Promise<Photo | null> {
  try {
    // Probeer de foto op te halen via de directe API
    const photo = await fetchPhotoById(id)

    // Als er geen foto is, gebruik de dummy foto
    if (!photo) {
      console.log(`Geen foto gevonden met id ${id}, gebruik dummy foto`)
      return dummyPhoto
    }

    return photo
  } catch (error) {
    console.error(`Error in getPhotoById for id ${id}:`, error)
    // Bij een fout, gebruik de dummy foto
    return dummyPhoto
  }
}

export async function uploadPhoto(formData: FormData): Promise<{ data?: any; error?: string }> {
  // Deze functie blijft ongewijzigd omdat deze via de API route werkt
  const file = formData.get("photo") as File | null

  if (!file) {
    return { error: "Geen bestand ontvangen" }
  }

  try {
    // Gebruik de API route om de foto te uploaden
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error || "Er is een fout opgetreden bij het uploaden" }
    }

    const data = await response.json()

    // Revalideer de paden om de nieuwe foto direct te tonen
    revalidatePath("/")
    revalidatePath("/archief")

    return { data }
  } catch (error: any) {
    console.error("Server error:", error)
    return { error: error.message || "Er is een onverwachte fout opgetreden" }
  }
}
