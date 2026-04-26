"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

// Leaflet's default icon URLs break when bundled by webpack/Next.js.
// Pointing to the CDN copy keeps the marker visible without copying static files.
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  selected: { lat: number; lng: number } | null
}

function ClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPicker({ onLocationSelect, selected }: MapPickerProps) {
  return (
    <MapContainer
      center={[-6.9175, 107.6191]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "260px", width: "100%", borderRadius: "16px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onLocationSelect={onLocationSelect} />
      {selected && <Marker position={[selected.lat, selected.lng]} icon={DefaultIcon} />}
    </MapContainer>
  )
}
