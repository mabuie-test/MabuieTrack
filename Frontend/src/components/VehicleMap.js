import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Ícone de carro para todos os pontos
const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function VehicleMap({ vehicleId, initialPositions }) {
  const [positions, setPositions] = useState(initialPositions || []);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API);

    // Entrar na sala do veículo
    socket.emit('joinVehicle', vehicleId);

    // Ao receber nova telemetria, acrescenta ao estado
    socket.on('newTelemetry', ({ vehicleId: vid, point }) => {
      if (vid === vehicleId) {
        setPositions(prev => [
          ...prev,
          { 
            lat: point.lat, lng: point.lng,
            speed: point.speed, battery: point.battery,
            at: point.at
          }
        ]);
      }
    });

    return () => {
      socket.emit('leaveVehicle', vehicleId);
      socket.disconnect();
    };
  }, [vehicleId]);

  if (!positions.length) return <p>Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[coords.length - 1]} zoom={13} style={{ height: '80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coords} />
      {positions.map((p, idx) => {
        const speed = typeof p.speed === 'number' ? p.speed : 0;
        const battery = typeof p.battery === 'number' ? p.battery : null;
        const date = p.at ? new Date(p.at) : null;
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
    </MapContainer>
  );
}
