import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet
const defaultIcon = new L.Icon.Default();

// Ícone de alfinete para pontos estacionários
const pinIcon = new L.DivIcon({
  html: '🛻',
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

      {/* Trajecto */}
      <Polyline positions={coords} />

      {positions.map((p, idx) => {
        // Garantir que speed é número
        const speed = typeof p.speed === 'number' ? p.speed : null;
        // Ponto parado só se speed === 0
        const isStationary = speed === 0;
        const icon = isStationary ? pinIcon : defaultIcon;

        // Conversão de data segura
        const date = p.at ? new Date(p.at) : null;
        const timeStr = date && !isNaN(date) 
          ? date.toLocaleTimeString() 
          : '—';

        return (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div>
                <strong>Ponto {idx + 1}</strong><br/>
                Velocidade: {speed !== null ? `${speed.toFixed(1)} km/h` : '—'}<br/>
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
            Velocidade: {typeof positions[positions.length - 1].speed === 'number'
              ? `${positions[positions.length - 1].speed.toFixed(1)} km/h`
              : '—'}<br/>
            Bateria: {typeof positions[positions.length - 1].bat === 'number'
              ? `${positions[positions.length - 1].bat.toFixed(2)} V`
              : '—'}<br/>
            Hora: {
              (() => {
                const d = positions[positions.length - 1].at ? new Date(positions[positions.length - 1].at) : null;
                return d && !isNaN(d) ? d.toLocaleString() : '—';
              })()
            }
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
