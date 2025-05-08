"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import type { Photo } from "@/lib/types"

interface LocationButtonProps {
  photo: Photo | null
  className?: string
}

export default function LocationButton({ photo, className }: LocationButtonProps) {
  const { toast } = useToast()

  function handleOpenMaps() {
    if (!photo?.location_name) {
      toast({
        title: "Geen locatie",
        description: "Er is nog geen locatie toegevoegd aan deze foto",
        variant: "destructive",
      })
      return
    }

    // Gebruik de locatienaam om Google Maps te openen
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(photo.location_name)}`

    // Gebruik window.open met try-catch om eventuele fouten af te handelen
    try {
      window.open(mapsUrl, "_blank")
    } catch (error) {
      console.error("Error opening maps:", error)
      toast({
        title: "Fout",
        description: "Kon Google Maps niet openen",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleOpenMaps}
      className={`flex flex-col items-center p-2 h-auto ${className}`}
      disabled={!photo?.location_name}
    >
      <div className="relative w-12 h-12 mb-1">
        <Image src="/2cv-icon.png" alt="2CV Auto" fill className="object-contain" />
      </div>
      <span className="text-xs">Locatie</span>
    </Button>
  )
}
