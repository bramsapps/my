import { getSupabaseClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // 1. Upload de foto naar Supabase Storage
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
      return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 })
    }

    // 2. Haal de publieke URL op
    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(fileName)

    // 3. Controleer of er bestaande foto's zijn en zet ze op is_current = false
    const { data: existingPhotos } = await supabase.from("photos").select("id").eq("is_current", true)

    if (existingPhotos && existingPhotos.length > 0) {
      const { error: updateError } = await supabase.from("photos").update({ is_current: false }).eq("is_current", true)

      if (updateError) {
        console.error("Update error details:", updateError)
        return NextResponse.json({ error: `Database update error: ${updateError.message}` }, { status: 500 })
      }
    }

    // 4. Voeg de nieuwe foto toe aan de database
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
      return NextResponse.json({ error: `Database insert error: ${error.message}` }, { status: 500 })
    }

    // Revalideer de paden om de nieuwe foto direct te tonen
    revalidatePath("/")
    revalidatePath("/archief")

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message || "Er is een onverwachte fout opgetreden" }, { status: 500 })
  }
}
