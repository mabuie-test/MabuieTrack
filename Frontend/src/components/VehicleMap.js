import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone de carro para todos os pontos
const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function VehicleMap({ positions }) {
  if (!positions.length) return <p>Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[0]} zoom={13} style={{ height: '80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Trajeto */}
      <Polyline positions={coords} />

      {positions.map((p, idx) => {
        const speed   = typeof p.speed   === 'number' ? p.speed   : 0;
        const battery = typeof p.battery === 'number' ? p.battery : null;
        const date    = p.at ? new Date(p.at) : null;
        const timeStr = date && !isNaN(date)
          ? date.toLocaleTimeString()
          : '—';

        return (
          <Marker key={idx} position={[p.lat, p.lng]} icon={carIcon}>
            <Popup>
              <div>
                <strong>Ponto {idx + 1}</strong><br/>
                Latitude: {p.lat.toFixed(5)}<br/>
                Longitude: {p.lng.toFixed(5)}<br/>
                Velocidade: {speed.toFixed(1)} km/h<br/>
                Bateria: {battery !== null ? `${battery.toFixed(2)} V` : '—'}<br/>
                Hora: {timeStr}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Última posição */}
      <Marker position={coords[coords.length - 1]} icon={carIcon}>
        <Popup>
          <div>
            <strong>Última Posição</strong><br/>
            Latitude: {positions[positions.length - 1].lat.toFixed(5)}<br/>
            Longitude: {positions[positions.length - 1].lng.toFixed(5)}<br/>
            Velocidade: {positions[positions.length - 1].speed?.toFixed(1) ?? '—'} km/h<br/>
            Bateria: {positions[positions.length - 1].battery?.toFixed(2) ?? '—'} V<br/>
            Hora: {new Date(positions[positions.length - 1].at).toLocaleString() ?? '—'}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
