"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Photo } from "@/lib/types"

interface LocationDateModalProps {
  photo: Photo | null
  trigger?: React.ReactNode
}

export default function LocationDateModal({ photo, trigger }: LocationDateModalProps) {
  const [open, setOpen] = useState(false)
  const [locationName, setLocationName] = useState(photo?.location_name || "")
  const [date, setDate] = useState<Date | undefined>(photo?.photo_date ? new Date(photo.photo_date) : undefined)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSave() {
    if (!photo?.id) return

    setIsSaving(true)
    try {
      // Gebruik server-side API route om de locatie en datum bij te werken
      let response
      try {
        response = await fetch("/api/update-location-date", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoId: photo.id,
            locationName,
            photoDate: date ? format(date, "yyyy-MM-dd") : null,
          }),
        })
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Netwerkfout: Kon geen verbinding maken met de server")
      }

      if (!response.ok) {
        let errorMessage = "Er is een fout opgetreden bij het opslaan"
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
        description: "Locatie en datum succesvol opgeslagen",
      })

      setOpen(false)

      // Gebruik een korte timeout om ervoor te zorgen dat de server tijd heeft om de data bij te werken
      setTimeout(() => {
        router.refresh()
      }, 500)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            Locatie & Datum
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Locatie & Datum</DialogTitle>
          <DialogDescription>Voeg een locatie en datum toe aan deze foto.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="location">Locatie</Label>
            <Input
              id="location"
              placeholder="Voer een adres of locatie in"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: nl }) : <span>Kies een datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving || !locationName}>
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
