import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import api from '../api';

export default function GeofenceEditor({ vehicleId, initialGeo }) {
  return (
    <MapContainer /* centro e zoom */>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={e=>{
            const coords = e.layer.getLatLngs()[0].map(p=>[p.lng,p.lat]);
            api.post(`/vehicles/${vehicleId}/geofence`,{ coordinates: coords });
            alert('Geofence guardado');
          }}
          draw={{ rectangle:false,polyline:false,marker:false,circle:false,circlemarker:false }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
