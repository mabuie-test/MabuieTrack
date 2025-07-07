import { useState, useEffect } from 'react';
import useSWR from 'swr';
import io from 'socket.io-client';
import {
  MapContainer,
  LayersControl,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

const { BaseLayer } = LayersControl;

// Ícone de carro para todos os pontos
const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// fetcher para SWR
const fetcher = url => api.get(url).then(r => r.data);

export default function VehicleMap({ vehicleId }) {
  // 1) Histórico inicial via SWR
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
    if (!initial) return;

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
    <MapContainer
      center={coords[coords.length - 1]}
      zoom={13}
      style={{ height: '80vh' }}
    >
      <LayersControl position="topright">
        {/* 1) Mapa Padrão (OSM) */}
        <BaseLayer checked name="OSM">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
        </BaseLayer>

        {/* 2) Satélite (ESRI World Imagery) */}
        <BaseLayer name="Satélite (ESRI)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri — Fonte: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
          />
        </BaseLayer>

        {/* 3) Stamen Terrain */}
        <BaseLayer name="Stamen Terrain">
          <TileLayer
            url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, CC BY 3.0; Data © <a href="http://openstreetmap.org">OSM</a>'
          />
        </BaseLayer>

        {/* 4) Stamen Toner */}
        <BaseLayer name="Stamen Toner">
          <TileLayer
            url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, CC BY 3.0; Data © <a href="http://openstreetmap.org">OSM</a>'
          />
        </BaseLayer>

        {/* 5) CartoDB Positron */}
        <BaseLayer name="CartoDB Positron">
          <TileLayer
            url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/">OSM</a> contributors, © <a href="https://carto.com/">CARTO</a>'
          />
        </BaseLayer>
      </LayersControl>

      {/* Linha do trajecto */}
      <Polyline positions={coords} />

      {/* Marcadores com popup */}
      {positions.map((p, idx) => {
        const speed   = typeof p.speed   === 'number' ? p.speed   : 0;
        const battery = typeof p.battery === 'number' ? p.battery : null;
        const date    = p.at ? new Date(p.at) : null;
        const timeStr = date && !isNaN(date)
          ? date.toLocaleTimeString()
          : '—';

        return (
          <Marker
            key={idx}
            position={[p.lat, p.lng]}
            icon={carIcon}
          >
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
