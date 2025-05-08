"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PhotoUploadFixed() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Gebruik FormData om het bestand te verzenden
      const formData = new FormData()
      formData.append("file", file)

      // Stuur het bestand naar de server-side API route
      let response
      try {
        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Netwerkfout: Kon geen verbinding maken met de server")
      }

      if (!response.ok) {
        let errorMessage = "Er is een fout opgetreden bij het uploaden"
        try {
          const result = await response.json()
          errorMessage = result.error || errorMessage
        } catch (e) {
          // Kon de foutmelding niet parsen, gebruik de standaard
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Succes",
        description: "Foto succesvol geüpload",
      })

      // Refresh de pagina om de nieuwe foto te tonen
      // Gebruik een korte timeout om ervoor te zorgen dat de server tijd heeft om de data bij te werken
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Fout bij uploaden",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset het input veld
      e.target.value = ""
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <div className="flex flex-col items-end gap-2">
        <Label htmlFor="photo-upload" className="sr-only">
          Upload een nieuwe foto
        </Label>
        <Input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          type="button"
          onClick={() => document.getElementById("photo-upload")?.click()}
          disabled={isUploading}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg"
        >
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
          <span className="sr-only">Upload foto</span>
        </Button>
      </div>
    </div>
  )
}
