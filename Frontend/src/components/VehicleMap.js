import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet
const defaultIcon = new L.Icon.Default();

// Ícone de alfinete para pontos estacionários (className 'leaflet-div-icon' aplica o estilo correto)
const pinIcon = new L.DivIcon({
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
        // Considere parado somente se speed === 0
        const speed = typeof p.speed === 'number' ? p.speed : 0;
        const isStationary = speed === 0;
        const icon = isStationary ? pinIcon : defaultIcon;

        // Data/hora
        const date = p.at ? new Date(p.at) : null;
        const timeStr = date && !isNaN(date)
          ? date.toLocaleTimeString()
          : '—';

        return (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div>
                <strong>Ponto {idx + 1}</strong><br/>
                Latitude: {p.lat.toFixed(5)}<br/>
                Longitude: {p.lng.toFixed(5)}<br/>
                Velocidade: {speed.toFixed(1)} km/h<br/>
                Bateria: {typeof p.bat === 'number' ? `${p.bat.toFixed(2)} V` : '—'}<br/>
                Hora: {timeStr}<br/>
                {isStationary && <strong>Estacionado aqui</strong>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Última posição */}
      <Marker position={coords[coords.length - 1]} icon={defaultIcon}>
        <Popup>
          <div>
            <strong>Última Posição</strong><br/>
            {(() => {
              const last = positions[positions.length - 1];
              const sp = typeof last.speed === 'number' ? last.speed : 0;
              const bt = typeof last.bat === 'number' ? last.bat : null;
              const dt = last.at ? new Date(last.at) : null;
              return (
                <>
                  Velocidade: {sp.toFixed(1)} km/h<br/>
                  Bateria: {bt !== null ? `${bt.toFixed(2)} V` : '—'}<br/>
                  Hora: {dt && !isNaN(dt) ? dt.toLocaleString() : '—'}
                </>
              );
            })()}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
