import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

export default function VehicleMap({ positions }) {
  if (!positions.length) return <p>Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[0]} zoom={13} style={{ height: '80vh' }}>
      {/* Corrigido: removido o `}` extra no final da string URL */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coords} />
      <Marker position={coords[coords.length - 1]} />
    </MapContainer>
  );
}
