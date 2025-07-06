import { useState, useEffect } from 'react';
import useSWR from 'swr';
import io from 'socket.io-client';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// fetcher para SWR
const fetcher = url => api.get(url).then(r => r.data);

export default function VehicleMap({ vehicleId }) {
  // 1) Historico inicial via SWR
  const { data: initial, error } = useSWR(
    () => `/vehicles/${vehicleId}/history?range=day`,
    fetcher
  );
  const [positions, setPositions] = useState([]);

  // 2) Quando o histórico carregar, atualiza positions
  useEffect(() => {
    if (initial) {
      setPositions(initial);
    }
  }, [initial]);

  // 3) Subscreve Socket.IO após histórico carregado
  useEffect(() => {
    if (!initial) return;  // aguarda o histórico

    const socket = io(process.env.NEXT_PUBLIC_API);

    socket.emit('joinVehicle', vehicleId);

    socket.on('newTelemetry', ({ vehicleId: vid, point }) => {
      if (vid === vehicleId) {
        setPositions(prev => [
          ...prev,
          {
            lat:     point.lat,
            lng:     point.lng,
            speed:   point.speed,
            battery: point.battery,
            at:      point.at
          }
        ]);
      }
    });

    return () => {
      socket.emit('leaveVehicle', vehicleId);
      socket.disconnect();
    };
  }, [vehicleId, initial]);

  if (error) return <p>Erro ao carregar histórico.</p>;
  if (!initial) return <p>Carregando histórico…</p>;
  if (!positions.length) return <p>Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[coords.length - 1]} zoom={13} style={{ height: '80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
              <strong>Ponto {idx + 1}</strong><br/>
              Latitude: {p.lat.toFixed(5)}<br/>
              Longitude: {p.lng.toFixed(5)}<br/>
              Velocidade: {speed.toFixed(1)} km/h<br/>
              Bateria: {battery !== null ? `${battery.toFixed(2)} V` : '—'}<br/>
              Hora: {timeStr}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
