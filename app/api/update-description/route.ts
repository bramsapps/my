import { getSupabaseClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { photoId, description } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: "Ontbrekende foto ID" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("photos").update({ description }).eq("id", photoId).select()

    if (error) {
      console.error("Update description error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message || "Er is een onverwachte fout opgetreden" }, { status: 500 })
  }
}
