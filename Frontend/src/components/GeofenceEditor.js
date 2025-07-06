import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import api from '../api';  // Ajuste aqui: certifique‑se de que este caminho está correto

// Carrega o EditControl apenas no cliente para evitar SSR
const EditControl = dynamic(
  () => import('react-leaflet-draw').then(mod => mod.EditControl),
  { ssr: false }
);

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  // Defina um centro e zoom padrão
  const center = initialGeo
    ? [initialGeo.coordinates[0][0][1], initialGeo.coordinates[0][0][0]]
    : [0, 0];
  const zoom = initialGeo ? 13 : 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '400px', marginBottom: '1rem' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={e => {
            const coords = e.layer.getLatLngs()[0].map(p => [p.lng, p.lat]);
            api.post(`/vehicles/${vehicleId}/geofence`, { coordinates: coords });
            alert('Geofence guardado!');
          }}
          draw={{
            rectangle:    false,
            polyline:     false,
            marker:       false,
            circle:       false,
            circlemarker: false
          }}
          edit={{
            edit:   true,
            remove: true
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
