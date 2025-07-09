import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import api from '../api';

const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const fetcher = url => api.get(url).then(r=>r.data);

export default function VehicleMap({ vehicleId }) {
  const [positions, setPositions] = useState([]);

  // histórico inicial
  useEffect(() => {
    fetcher(`/vehicles/${vehicleId}/history?range=day`)
      .then(hist => setPositions(hist))
      .catch(()=>{/* ignore */});
  }, [vehicleId]);

  // real‑time
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API);
    socket.emit('joinVehicle', vehicleId);
    socket.on('newTelemetry', ({ point, vehicleId: vid }) => {
      if (vid===vehicleId) setPositions(p=>[...p, point]);
    });
    return ()=>{ socket.emit('leaveVehicle', vehicleId); socket.disconnect(); };
  }, [vehicleId]);

  if (!positions.length) return <p className="p-4">Sem dados para exibir.</p>;

  const coords = positions.map(p => [p.lat, p.lng]);
  const { BaseLayer } = LayersControl;

  return (
    <MapContainer center={coords[0]} zoom={13} className="h-[60vh] w-full mb-4">
      <LayersControl position="topright">
        <BaseLayer checked name="OSM">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </BaseLayer>
        <BaseLayer name="Satélite (ESRI)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri"
          />
        </BaseLayer>
      </LayersControl>
      <Polyline positions={coords} />
      {positions.map((p,i)=>(
        <Marker key={i} position={[p.lat,p.lng]} icon={carIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Ponto {i+1}</strong><br/>
              Lat: {p.lat.toFixed(5)}, Lng: {p.lng.toFixed(5)}<br/>
              Velocidade: {p.speed.toFixed(1)} km/h<br/>
              Bateria: {p.battery.toFixed(2)} V<br/>
              Hora: {new Date(p.at).toLocaleTimeString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
