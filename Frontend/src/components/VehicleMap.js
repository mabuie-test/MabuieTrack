import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícones
const defaultIcon = new L.Icon.Default();
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
        // Safe parsing
        const speed = typeof p.speed === 'number' ? p.speed : null;
        const bat   = typeof p.bat   === 'number' ? p.bat   : null;
        const date  = p.at ? new Date(p.at) : null;
        const timeStr = date && !isNaN(date)
          ? date.toLocaleTimeString()
          : '—';

        const isStationary = speed !== null ? speed < 1 : false;
        const icon = isStationary ? pinIcon : defaultIcon;

        return (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div>
                <strong>Ponto {idx + 1}</strong><br/>
                Latitude: {p.lat.toFixed(5)}<br/>
                Longitude: {p.lng.toFixed(5)}<br/>
                Velocidade: {speed !== null ? `${speed.toFixed(1)} km/h` : '—'}<br/>
                Bateria: {bat   !== null ? `${bat.toFixed(2)} V` : '—'}<br/>
                Hora: {timeStr}<br/>
                {isStationary && <strong>Estacionado aqui</strong>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Última posição destacada */}
      <Marker position={coords[coords.length - 1]} icon={defaultIcon}>
        <Popup>
          <div>
            <strong>Última Posição</strong><br/>
            Velocidade: {
              typeof positions[positions.length - 1].speed === 'number'
                ? `${positions[positions.length - 1].speed.toFixed(1)} km/h`
                : '—'
            }<br/>
            Bateria: {
              typeof positions[positions.length - 1].bat === 'number'
                ? `${positions[positions.length - 1].bat.toFixed(2)} V`
                : '—'
            }<br/>
            Hora: {
              (() => {
                const d = positions[positions.length - 1].at
                  ? new Date(positions[positions.length - 1].at)
                  : null;
                return d && !isNaN(d)
                  ? d.toLocaleString()
                  : '—';
              })()
            }
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
