import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function GeoMap({ points }: { points: { lat: number, lon: number, count: number }[] }){
  const center = [9.08, 8.67] as [number, number] // default Nigeria-ish center
  const max = Math.max(1, ...points.map(p=>p.count))
  return (
    <MapContainer center={center} zoom={5} style={{ height:'100%', width:'100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p,i)=> (
        <CircleMarker key={i} center={[p.lat, p.lon]} radius={4 + (12 * (p.count/max))} pathOptions={{ color:'#ef4444', fillColor:'#ef4444', fillOpacity:0.5 }}>
          <Tooltip>Count: {p.count}<br/>Lat: {p.lat}, Lon: {p.lon}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
