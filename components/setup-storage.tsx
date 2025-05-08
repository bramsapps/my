"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SetupStorage() {
  const [isSetup, setIsSetup] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function setupStorage() {
      try {
        let response
        try {
          response = await fetch("/api/create-bucket")
        } catch (fetchError) {
          console.error("Fetch error:", fetchError)
          // Stil falen, geen toast tonen
          return
        }

        if (!response.ok) {
          throw new Error("Failed to setup storage")
        }

        const data = await response.json()
        setIsSetup(true)
        console.log("Storage setup complete:", data)
      } catch (error: any) {
        console.error("Setup error:", error)
        // Stil falen, geen toast tonen
      }
    }

    setupStorage()
  }, [toast])

  return null
}
