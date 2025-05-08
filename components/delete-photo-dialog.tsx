"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Photo } from "@/lib/types"

interface DeletePhotoDialogProps {
  photo: Photo
}

export default function DeletePhotoDialog({ photo }: DeletePhotoDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete() {
    if (!photo?.id) return

    setIsDeleting(true)
    try {
      // Gebruik server-side API route om de foto te verwijderen
      let response
      try {
        response = await fetch(`/api/delete-photo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoId: photo.id,
          }),
        })
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Netwerkfout: Kon geen verbinding maken met de server")
      }

      if (!response.ok) {
        let errorMessage = "Er is een fout opgetreden bij het verwijderen"
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
        description: "Foto succesvol verwijderd",
      })

      setOpen(false)

      // Navigeer terug naar het archief
      router.push("/archief")
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Verwijderen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Foto verwijderen</DialogTitle>
          <DialogDescription>
            Weet je zeker dat je deze foto wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Verwijderen..." : "Ja, verwijderen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
