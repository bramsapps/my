import { createServerSupabaseClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { photoId, lat, lng, name } = await request.json()

    if (!photoId || !lat || !lng) {
      return NextResponse.json({ error: "Ontbrekende vereiste velden" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("photos")
      .update({
        location_lat: lat,
        location_lng: lng,
        location_name: name,
      })
      .eq("id", photoId)
      .select()

    if (error) {
      console.error("Update location error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message || "Er is een onverwachte fout opgetreden" }, { status: 500 })
  }
}
