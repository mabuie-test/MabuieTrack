import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function VehicleMap({ vehicleId }) {
  const [positions, setPositions] = useState([]);

  // Histórico inicial
  useEffect(() => {
    fetch(`/api/vehicles/${vehicleId}/history?range=day`)
      .then(r=>r.json())
      .then(setPositions);
  }, [vehicleId]);

  // Real‑time com Socket.IO
  useEffect(() => {
    const socket = io();
    socket.emit('joinVehicle', vehicleId);
    socket.on('newTelemetry', ({ point }) => setPositions(prev => [...prev, point]));
    return () => { socket.emit('leaveVehicle', vehicleId); socket.disconnect(); };
  }, [vehicleId]);

  if (!positions.length) return <p className="p-4">Sem dados para exibir.</p>;

  const coords = positions.map(p=>[p.lat,p.lng]);
  return (
    <MapContainer center={coords[0]} zoom={13} className="h-96 w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coords} />
      {positions.map((p,i)=>(
        <Marker key={i} position={[p.lat,p.lng]}>
          <Popup>
            <div>
              <b>Ponto {i+1}</b><br/>
              Vel: {p.speed} km/h<br/>
              Bat: {p.battery} V<br/>
              Hora: {new Date(p.at).toLocaleTimeString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
