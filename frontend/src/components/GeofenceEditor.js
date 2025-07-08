// src/components/GeofenceEditor.js
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl }                         from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import api                                     from '../api';

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  const fgRef = useRef();

  // Quando inicialGeo mudar, desenha o polígono existente
  useEffect(() => {
    if (initialGeo && fgRef.current) {
      const layers = fgRef.current._layers;
      Object.values(layers).forEach(layer => fgRef.current.removeLayer(layer));
      const coords = initialGeo.coordinates[0].map(([lng, lat]) => [lat, lng]);
      const polygon = window.L.polygon(coords);
      fgRef.current.addLayer(polygon);
    }
  }, [initialGeo]);

  const center = initialGeo
    ? [initialGeo.coordinates[0][0][1], initialGeo.coordinates[0][0][0]]
    : [0, 0];
  const zoom = initialGeo ? 13 : 2;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', margin: '1rem 0' }}>
      {/* Linha correta sem chave extra */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FeatureGroup ref={fgRef}>
        <EditControl
          position="topright"
          draw={{
            rectangle:    false,
            polyline:     false,
            marker:       false,
            circle:       false,
            circlemarker: false
          }}
          edit={{ edit: true, remove: true }}
          onCreated={e => {
            const coords = e.layer.getLatLngs()[0].map(p => [p.lng, p.lat]);
            api.post(`/vehicles/${vehicleId}/geofence`, { coordinates: coords });
            alert('Geofence guardado!');
          }}
          onEdited={e => {
            const layer = e.layers.getLayers()[0];
            const coords = layer.getLatLngs()[0].map(p => [p.lng, p.lat]);
            api.post(`/vehicles/${vehicleId}/geofence`, { coordinates: coords });
            alert('Geofence actualizado!');
          }}
          onDeleted={e => {
            api.post(`/vehicles/${vehicleId}/geofence`, { coordinates: [] });
            alert('Geofence removido!');
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
