import { getAllPhotos } from "@/lib/actions"
import PhotoGrid from "@/components/photo-grid"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Archief - Twee Stoelen",
  description: "Bekijk alle foto's van Twee Stoelen",
}

export default async function ArchiefPage() {
  // Probeer alle foto's op te halen, maar vang fouten op
  let photos = []
  let fetchError = false

  try {
    photos = await getAllPhotos()
  } catch (error) {
    console.error("Error fetching photos:", error)
    fetchError = true
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Foto Archief</h1>
        <Link href="/reset">
          <Button variant="outline" size="sm">
            Reset Website
          </Button>
        </Link>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 max-w-md mx-auto mb-8">
          <p className="font-medium">Database verbindingsfout</p>
          <p className="text-sm mt-1">
            Er kon geen verbinding worden gemaakt met de database. Controleer de netwerkinstellingen en probeer het
            opnieuw.
          </p>
        </div>
      )}

      {photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {fetchError
              ? "Kon geen foto's ophalen vanwege een verbindingsprobleem."
              : "Er zijn nog geen foto's geüpload. Begin met het toevoegen van je eerste foto."}
          </p>
          <Link href="/">
            <Button>Terug naar Home</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
