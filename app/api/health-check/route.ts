import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-server"

// Uitgebreide health check endpoint om te controleren of de server en database bereikbaar zijn
export async function GET() {
  try {
    // Controleer de Supabase verbinding
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("photos").select("count").limit(1)

    if (error) {
      console.error("Database health check error:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database is niet bereikbaar",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Er is een fout opgetreden bij de health check",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
