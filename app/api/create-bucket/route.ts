import { getSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Controleer of de bucket bestaat
    const { data: buckets } = await supabase.storage.listBuckets()
    const photosBucketExists = buckets?.some((bucket) => bucket.name === "photos")

    if (!photosBucketExists) {
      // Maak de bucket aan als deze niet bestaat
      const { data, error } = await supabase.storage.createBucket("photos", {
        public: true,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Stel RLS-beleid in voor de bucket
      const { error: policyError } = await supabase.storage.from("photos").createPolicy("Public Access Policy", {
        name: "Public Access Policy",
        definition: {
          statements: [
            {
              effect: "allow",
              action: "insert",
              principal: "*",
            },
            {
              effect: "allow",
              action: "select",
              principal: "*",
            },
            {
              effect: "allow",
              action: "update",
              principal: "*",
            },
          ],
        },
      })

      if (policyError) {
        console.error("Policy error:", policyError)
      }

      return NextResponse.json({ message: "Bucket created successfully", data })
    }

    // Controleer en update beleid voor bestaande bucket
    try {
      await supabase.storage.from("photos").getPublicUrl("test.txt")
    } catch (error) {
      console.log("Updating bucket policies...")
      await supabase.storage.from("photos").createPolicy("Public Access Policy", {
        name: "Public Access Policy",
        definition: {
          statements: [
            {
              effect: "allow",
              action: "insert",
              principal: "*",
            },
            {
              effect: "allow",
              action: "select",
              principal: "*",
            },
            {
              effect: "allow",
              action: "update",
              principal: "*",
            },
          ],
        },
      })
    }

    return NextResponse.json({ message: "Bucket already exists" })
  } catch (error: any) {
    console.error("Error creating bucket:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
