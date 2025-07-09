import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import 'leaflet/dist/leaflet.css';

const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24,24],
  iconAnchor: [12,24]
});

export default function VehicleMap({ vehicleId }) {
  const [positions, setPositions] = useState([]);

  // carrega histórico
  useEffect(() => {
    api.get(`/vehicles/${vehicleId}/history?range=day`)
      .then(r => setPositions(r.data))
      .catch(() => {});
  }, [vehicleId]);

  // subscreve real‑time
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API);
    socket.emit('joinVehicle', vehicleId);
    socket.on('newTelemetry', ({ point }) => {
      setPositions(p => [...p, point]);
    });
    return () => socket.disconnect();
  }, [vehicleId]);

  if (!positions.length) return <p>Sem dados para exibir.</p>;
  const coords = positions.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={coords[0]} zoom={13} style={{ height:'80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coords} />
      {positions.map((p,i)=>(
        <Marker key={i} position={[p.lat,p.lng]} icon={carIcon}>
          <Popup>
            <div>
              <strong>Ponto {i+1}</strong><br/>
              Lat: {p.lat.toFixed(5)}<br/>
              Lng: {p.lng.toFixed(5)}<br/>
              Velocidade: {p.speed?.toFixed(1)||'—'} km/h<br/>
              Bateria: {p.battery?.toFixed(2)||'—'} V<br/>
              Hora: {new Date(p.at).toLocaleTimeString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
