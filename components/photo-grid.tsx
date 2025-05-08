import Image from "next/image"
import Link from "next/link"
import DownloadButton from "@/components/download-button"
import type { Photo } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface PhotoGridProps {
  photos: Photo[]
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nog geen foto's geüpload</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => {
        // Bepaal de bestandsnaam voor de download
        const fileName = photo.location_name
          ? `twee-stoelen-${photo.location_name.toLowerCase().replace(/\s+/g, "-")}.jpg`
          : `twee-stoelen-foto-${photo.id}.jpg`

        return (
          <div key={photo.id} className="group overflow-hidden rounded-lg shadow-lg">
            <div className="border-8 border-white rounded-lg overflow-hidden">
              <Link href={`/foto/${photo.id}`} className="block">
                <div className="aspect-square relative">
                  <Image
                    src={photo.image_url || "/placeholder.svg"}
                    alt={photo.description || `Foto ${photo.id}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
            </div>
            <div className="p-3 bg-white">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium truncate">{photo.location_name || "Onbekende locatie"}</p>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <p>{photo.photo_date ? formatDate(photo.photo_date) : formatDate(photo.created_at)}</p>
                <DownloadButton imageUrl={photo.image_url} fileName={fileName} size="sm" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
