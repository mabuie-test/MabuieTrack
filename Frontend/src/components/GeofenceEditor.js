import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import api from '../api';

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  // centro e zoom padrão (ajuste conforme necessário)
  const center = initialGeo
    ? [initialGeo.coordinates[0][0][1], initialGeo.coordinates[0][0][0]]
    : [0, 0];
  const zoom = initialGeo ? 13 : 2;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', marginBottom: '1rem' }}>
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
            rectangle: false,
            polyline:  false,
            marker:    false,
            circle:    false,
            circlemarker: false
          }}
          edit={{
            remove: true,
            edit:   true
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
