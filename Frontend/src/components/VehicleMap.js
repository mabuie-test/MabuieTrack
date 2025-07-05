import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão (linha do trajecto)
const defaultIcon = new L.Icon.Default();

// Ícone de alfinete (📌) para pontos estacionários
const pinIcon = new L.DivIcon({
  html: '📌',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function VehicleMap({ positions }) {
  if (!positions.length) return <p>Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[0]} zoom={13} style={{ height: '80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Linha do trajecto */}
      <Polyline positions={coords} />

      {positions.map((p, idx) => {
        const isStationary = (p.speed ?? 0) < 1; // limiar de 1 km/h
        const icon = isStationary ? pinIcon : defaultIcon;
        return (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div>
                <strong>Ponto {idx + 1}</strong><br/>
                Latitude: {p.lat.toFixed(5)}<br/>
                Longitude: {p.lng.toFixed(5)}<br/>
                Velocidade: {p.speed?.toFixed(1) ?? '—'} km/h<br/>
                Bateria: {p.bat?.toFixed(2) ?? '—'} V<br/>
                <em>Hora: {new Date(p.at).toLocaleTimeString()}</em>
                {isStationary && (
                  <><br/><strong>Estacionado aqui</strong></>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Marcador final (destacado) */}
      <Marker position={coords[coords.length - 1]} icon={defaultIcon}>
        <Popup>
          <div>
            <strong>Última Posição</strong><br/>
            Velocidade: {positions[positions.length - 1].speed?.toFixed(1) ?? '—'} km/h<br/>
            Bateria: {positions[positions.length - 1].bat?.toFixed(2) ?? '—'} V<br/>
            Hora: {new Date(positions[positions.length - 1].at).toLocaleString()}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
