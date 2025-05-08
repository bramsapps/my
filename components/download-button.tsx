"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DownloadButtonProps {
  imageUrl: string
  fileName?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function DownloadButton({
  imageUrl,
  fileName = "foto.jpg",
  variant = "outline",
  size = "default",
  className,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  async function handleDownload() {
    if (!imageUrl) return

    setIsDownloading(true)
    try {
      // Haal de afbeelding op
      let response
      try {
        response = await fetch(imageUrl)
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Netwerkfout: Kon de afbeelding niet downloaden")
      }

      if (!response.ok) {
        throw new Error("Kon de afbeelding niet downloaden")
      }

      const blob = await response.blob()

      // Maak een tijdelijke link om de download te starten
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Ruim op
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "Succes",
        description: "Foto is gedownload",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het downloaden",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={isDownloading} className={className}>
      <Download className="h-4 w-4 mr-2" />
      {isDownloading ? "Downloaden..." : "Download"}
    </Button>
  )
}
