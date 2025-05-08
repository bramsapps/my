"use server"

import { getSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Start database reset...")

    // Gebruik de veilige client functie
    const supabase = getSupabaseClient()
    console.log("Supabase client created successfully")

    // 1. Verwijder alle foto's uit de database
    console.log("Attempting to delete photos from database...")
    try {
      const { error: deleteError } = await supabase.from("photos").delete().neq("id", 0)

      if (deleteError) {
        console.error("Fout bij het verwijderen van foto's:", deleteError)
        return {
          success: false,
          message: `Fout bij het verwijderen van foto's: ${deleteError.message}`,
        }
      }
      console.log("Photos deleted successfully")
    } catch (deleteError: any) {
      console.error("Exception bij het verwijderen van foto's:", deleteError)
      return {
        success: false,
        message: `Exception bij het verwijderen van foto's: ${deleteError.message}`,
      }
    }

    // 2. Probeer alle bestanden uit de storage te verwijderen
    console.log("Attempting to delete files from storage...")
    try {
      const { data: files, error: listError } = await supabase.storage.from("photos").list()

      if (listError) {
        console.error("Fout bij het ophalen van bestanden:", listError)
        // We gaan door, zelfs als het ophalen van bestanden mislukt
      } else if (files && files.length > 0) {
        console.log(`Found ${files.length} files to delete`)
        const filePaths = files.map((file) => file.name)
        const { error: removeError } = await supabase.storage.from("photos").remove(filePaths)

        if (removeError) {
          console.error("Fout bij het verwijderen van bestanden:", removeError)
          // We gaan door, zelfs als het verwijderen van bestanden mislukt
        } else {
          console.log("Files deleted successfully")
        }
      } else {
        console.log("No files found to delete")
      }
    } catch (storageError: any) {
      console.error("Exception bij het verwijderen van bestanden:", storageError)
      // We gaan door, zelfs als het verwijderen uit storage mislukt
    }

    // Revalideer de paden om de wijzigingen direct te tonen
    console.log("Revalidating paths...")
    revalidatePath("/")
    revalidatePath("/archief")

    return {
      success: true,
      message: "De database is succesvol gereset. Alle foto's en bestanden zijn verwijderd.",
    }
  } catch (error: any) {
    console.error("Onverwachte fout bij het resetten van de database:", error)
    return {
      success: false,
      message: error.message || "Er is een onverwachte fout opgetreden",
    }
  }
}
