import React from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl }                         from 'react-leaflet-draw';
import api                                     from '../api';

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  // Se existir um geofence, centraliza nele
  const center = initialGeo
    ? [initialGeo.coordinates[0][0][1], initialGeo.coordinates[0][0][0]]
    : [0, 0];
  const zoom = initialGeo ? 13 : 2;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', margin: '1rem 0' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FeatureGroup>
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
            // Apaga o geofence no backend
            api.post(`/vehicles/${vehicleId}/geofence`, { coordinates: [] });
            alert('Geofence removido!');
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
