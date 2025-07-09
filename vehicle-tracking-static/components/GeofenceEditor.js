import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  const center = initialGeo
    ? [ initialGeo.coordinates[0][0][1], initialGeo.coordinates[0][0][0] ]
    : [0, 0];
  const zoom = initialGeo ? 13 : 2;

  return (
    <MapContainer center={center} zoom={zoom} className="h-80 w-full mb-6">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false, polyline:false, marker:false, circle:false
          }}
          edit={{ edit:true, remove:true }}
          onCreated={e => {
            const coords = e.layer.getLatLngs()[0].map(p=>[p.lng,p.lat]);
            axios.post(`/api/vehicles/${vehicleId}/geofence`, { coordinates: coords });
            alert('Geofence guardado!');
          }}
          onEdited={e => {
            const layer = e.layers.getLayers()[0];
            const coords = layer.getLatLngs()[0].map(p=>[p.lng,p.lat]);
            axios.post(`/api/vehicles/${vehicleId}/geofence`, { coordinates: coords });
            alert('Geofence actualizado!');
          }}
          onDeleted={e => {
            axios.post(`/api/vehicles/${vehicleId}/geofence`, { coordinates: [] });
            alert('Geofence removido!');
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}

