import { getPhotoById } from "@/lib/actions"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import DescriptionEditor from "@/components/description-editor"
import LocationDateModal from "@/components/location-date-modal"
import DownloadButton from "@/components/download-button"
import DeletePhotoDialog from "@/components/delete-photo-dialog"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const photo = await getPhotoById(Number.parseInt(params.id))

    if (!photo) {
      return {
        title: "Foto niet gevonden - Twee Stoelen",
      }
    }

    return {
      title: `${photo.location_name || "Foto"} - Twee Stoelen`,
      description: photo.description || "Bekijk deze foto van Twee Stoelen",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Fout - Twee Stoelen",
    }
  }
}

export default async function FotoDetailPage({ params }: { params: { id: string } }) {
  let photo = null
  let fetchError = false

  try {
    photo = await getPhotoById(Number.parseInt(params.id))
  } catch (error) {
    console.error("Error fetching photo:", error)
    fetchError = true
  }

  if (!photo) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-4">
          <Link href="/archief">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar archief
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Foto niet gevonden</h2>
          <p className="text-muted-foreground">
            De foto die je zoekt bestaat niet of er is een probleem met de database verbinding.
          </p>
          {fetchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 max-w-md mx-auto mt-4">
              <p className="font-medium">Database verbindingsfout</p>
              <p className="text-sm mt-1">
                Er kon geen verbinding worden gemaakt met de database. Controleer de netwerkinstellingen en probeer het
                opnieuw.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Bepaal de bestandsnaam voor de download
  const fileName = photo.location_name
    ? `twee-stoelen-${photo.location_name.toLowerCase().replace(/\s+/g, "-")}.jpg`
    : `twee-stoelen-foto-${photo.id}.jpg`

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-4">
        <Link href="/archief">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar archief
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative border-8 border-white shadow-xl rounded-md overflow-hidden max-w-3xl">
            <Image
              src={photo.image_url || "/placeholder.svg"}
              alt={photo.description || `Foto ${photo.id}`}
              width={1200}
              height={800}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">Geüpload op {formatDate(photo.created_at, true)}</div>
            <div className="flex gap-2">
              <DownloadButton imageUrl={photo.image_url} fileName={fileName} />
              {photo.location_name && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(photo.location_name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <div className="relative w-10 h-10">
                    <Image src="/2cv-icon.png" alt="2CV Auto" fill className="object-contain" />
                  </div>
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Locatie & Datum</h2>
              <div className="p-4 border rounded-md">
                <p className="font-medium">{photo.location_name || "Geen locatie opgegeven"}</p>
                <p className="text-muted-foreground">
                  {photo.photo_date ? formatDate(photo.photo_date) : "Geen datum opgegeven"}
                </p>
              </div>
              {!photo.location_name && (
                <div className="mt-2 flex justify-end">
                  <LocationDateModal photo={photo} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Beschrijving</h2>
          <DescriptionEditor photo={photo} />
        </div>

        {/* Verwijderknop onderaan */}
        <div className="md:col-span-2 flex justify-center mt-8">
          <DeletePhotoDialog photo={photo} />
        </div>
      </div>
    </div>
  )
}
