"use client"

import { useState } from "react"
import { uploadPhoto } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

export default function PhotoUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsUploading(true)
    try {
      const result = await uploadPhoto(formData)

      if (result.error) {
        toast({
          title: "Fout",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Succes",
          description: "Foto succesvol geüpload",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <form action={handleSubmit}>
        <div className="flex flex-col items-end gap-2">
          <Label htmlFor="photo" className="sr-only">
            Upload een nieuwe foto
          </Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const form = e.target.form
                if (form) {
                  const formData = new FormData(form)
                  handleSubmit(formData)
                }
              }
            }}
          />
          <Button
            type="button"
            onClick={() => document.getElementById("photo")?.click()}
            disabled={isUploading}
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg"
          >
            <Upload className="h-6 w-6" />
            <span className="sr-only">Upload foto</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
