import { getCurrentPhoto } from "@/lib/actions"
import PhotoUploadFixed from "@/components/photo-upload-fixed"
import LocationDateModal from "@/components/location-date-modal"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar } from "lucide-react"

export default async function Home() {
  // Probeer de huidige foto op te halen
  let currentPhoto = null
  let fetchError = false

  try {
    currentPhoto = await getCurrentPhoto()
  } catch (error) {
    console.error("Error fetching current photo:", error)
    fetchError = true
  }

  if (currentPhoto) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="space-y-8">
          {/* Foto in kader */}
          <div className="flex justify-center">
            <div className="relative border-8 border-white shadow-xl rounded-md overflow-hidden max-w-3xl">
              <Image
                src={currentPhoto.image_url || "/placeholder.svg?height=1080&width=1920&query=landscape"}
                alt="Huidige foto"
                width={1200}
                height={800}
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          </div>

          {/* Locatie en datum informatie onder de foto */}
          {currentPhoto.location_name && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white shadow-md rounded-lg p-4 max-w-md w-full">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <h3 className="font-semibold text-lg">Locatie</h3>
                </div>
                <p className="text-gray-700">{currentPhoto.location_name}</p>
              </div>

              {currentPhoto.photo_date && (
                <div className="bg-white shadow-md rounded-lg p-4 max-w-md w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <h3 className="font-semibold text-lg">Datum</h3>
                  </div>
                  <p className="text-gray-700">{formatDate(currentPhoto.photo_date)}</p>
                </div>
              )}

              {/* Google Maps knop met autootje */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  currentPhoto.location_name,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black rounded-md transition-colors shadow-md"
              >
                <div className="relative w-8 h-8">
                  <Image src="/2cv-icon.png" alt="2CV Auto" fill className="object-contain" />
                </div>
                <span className="font-medium">Route bepalen</span>
              </a>
            </div>
          )}

          {/* Knop om locatie en datum toe te voegen als deze nog niet zijn ingesteld */}
          {!currentPhoto.location_name && (
            <div className="flex justify-center">
              <LocationDateModal
                photo={currentPhoto}
                trigger={
                  <Button size="lg" className="gap-2">
                    <MapPin className="h-5 w-5" />
                    Locatie & Datum toevoegen
                  </Button>
                }
              />
            </div>
          )}
        </div>
        <PhotoUploadFixed />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Welkom bij Twee Stoelen</h2>
        <p className="mb-8 max-w-md">
          {fetchError
            ? "Er is een probleem met de verbinding naar de database. Probeer het later opnieuw."
            : "Upload je eerste foto om te beginnen. De foto zal worden weergegeven en je kunt een locatie en datum toevoegen."}
        </p>

        <div className="flex gap-4 mb-8">
          <Link href="/archief">
            <Button variant="outline">Bekijk Archief</Button>
          </Link>
          <Link href="/reset">
            <Button variant="outline">Reset Website</Button>
          </Link>
        </div>

        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 max-w-md mb-8">
            <p className="font-medium">Database verbindingsfout</p>
            <p className="text-sm mt-1">
              Er kon geen verbinding worden gemaakt met de database. Controleer de netwerkinstellingen en probeer het
              opnieuw.
            </p>
          </div>
        )}

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 max-w-md">
          <p className="font-medium">Supabase verbinding</p>
          <p className="text-sm mt-1">
            Zorg ervoor dat je de juiste Supabase omgevingsvariabelen hebt ingesteld in je Vercel project:
          </p>
          <ul className="text-sm list-disc list-inside mt-2">
            <li>SUPABASE_URL</li>
            <li>SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>

      {/* Upload knop */}
      <PhotoUploadFixed />
    </div>
  )
}
