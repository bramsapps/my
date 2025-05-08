"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Photo } from "@/lib/types"

interface DescriptionEditorProps {
  photo: Photo
}

export default function DescriptionEditor({ photo }: DescriptionEditorProps) {
  const [description, setDescription] = useState(photo.description || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSave() {
    setIsSaving(true)
    try {
      // Gebruik server-side API route om de beschrijving bij te werken
      let response
      try {
        response = await fetch("/api/update-description", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoId: photo.id,
            description,
          }),
        })
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Netwerkfout: Kon geen verbinding maken met de server")
      }

      if (!response.ok) {
        let errorMessage = "Er is een fout opgetreden bij het opslaan van de beschrijving"
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
        description: "Beschrijving succesvol opgeslagen",
      })

      setIsEditing(false)

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

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Voeg een beschrijving toe..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDescription(photo.description || "")
              setIsEditing(false)
            }}
          >
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {photo.description ? (
        <p className="whitespace-pre-wrap">{photo.description}</p>
      ) : (
        <p className="text-muted-foreground italic">Geen beschrijving</p>
      )}
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        {photo.description ? "Bewerken" : "Beschrijving toevoegen"}
      </Button>
    </div>
  )
}
