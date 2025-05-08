"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

interface MapComponentProps {
  position: [number, number] | null
  setPosition?: (position: [number, number]) => void
  locationName: string
}

function LocationPicker({
  setPosition,
}: {
  setPosition?: (position: [number, number]) => void
}) {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition([e.latlng.lat, e.latlng.lng])
      }
    },
  })

  return null
}

export default function MapComponent({ position, setPosition, locationName }: MapComponentProps) {
  // Fallback positie (Nederland)
  const defaultPosition: [number, number] = [52.1326, 5.2913]

  return (
    <MapContainer
      center={position || defaultPosition}
      zoom={position ? 13 : 7}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {setPosition && <LocationPicker setPosition={setPosition} />}

      {position && (
        <Marker position={position}>
          <Popup>{locationName || "Geen naam opgegeven"}</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
