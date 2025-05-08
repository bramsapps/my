"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Photo } from "@/lib/types"

// Dynamisch importeren van Leaflet componenten om SSR problemen te voorkomen
const MapWithNoSSR = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
      <p>Kaart laden...</p>
    </div>
  ),
})

interface LocationMapProps {
  photo: Photo | null
  editable?: boolean
}

export default function LocationMap({ photo, editable = false }: LocationMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    photo?.location_lat && photo?.location_lng ? [photo.location_lat, photo.location_lng] : null,
  )
  const [locationName, setLocationName] = useState(photo?.location_name || "")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (photo?.location_lat && photo?.location_lng) {
      setPosition([photo.location_lat, photo.location_lng])
    }
    setLocationName(photo?.location_name || "")
  }, [photo])

  async function handleSaveLocation() {
    if (!photo?.id || !position) return

    setIsSaving(true)
    try {
      // Gebruik server-side API route om de locatie bij te werken
      const response = await fetch("/api/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoId: photo.id,
          lat: position[0],
          lng: position[1],
          name: locationName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Er is een fout opgetreden bij het opslaan van de locatie")
      }

      toast({
        title: "Succes",
        description: "Locatie succesvol opgeslagen",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-[300px] w-full relative">
      <MapWithNoSSR position={position} setPosition={editable ? setPosition : undefined} locationName={locationName} />

      {editable && (
        <div className="absolute bottom-2 left-2 right-2 bg-white p-2 rounded-md shadow-md z-[1000]">
          <div className="flex gap-2">
            <Input
              placeholder="Locatienaam"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveLocation} disabled={isSaving || !position}>
              {isSaving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
