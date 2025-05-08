import { getSupabaseClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: "Geen foto ID ontvangen" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Haal eerst de foto op om te controleren of het de huidige foto is
    const { data: photo, error: fetchError } = await supabase.from("photos").select("*").eq("id", photoId).single()

    if (fetchError) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json({ error: `Fout bij ophalen foto: ${fetchError.message}` }, { status: 500 })
    }

    // Verwijder de foto uit de database
    const { error: deleteError } = await supabase.from("photos").delete().eq("id", photoId)

    if (deleteError) {
      console.error("Delete error:", deleteError)
      return NextResponse.json({ error: `Fout bij verwijderen foto: ${deleteError.message}` }, { status: 500 })
    }

    // Als dit de huidige foto was, maak de meest recente foto de huidige
    if (photo.is_current) {
      const { data: latestPhoto, error: latestError } = await supabase
        .from("photos")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!latestError && latestPhoto) {
        await supabase.from("photos").update({ is_current: true }).eq("id", latestPhoto.id)
      }
    }

    // Probeer ook de afbeelding uit storage te verwijderen
    // Haal de bestandsnaam uit de URL
    if (photo.image_url) {
      try {
        const fileName = photo.image_url.split("/").pop()
        if (fileName) {
          await supabase.storage.from("photos").remove([fileName])
        }
      } catch (storageError) {
        console.error("Storage delete error:", storageError)
        // We gaan door, zelfs als het verwijderen uit storage mislukt
      }
    }

    // Revalideer de paden
    revalidatePath("/")
    revalidatePath("/archief")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message || "Er is een onverwachte fout opgetreden" }, { status: 500 })
  }
}
