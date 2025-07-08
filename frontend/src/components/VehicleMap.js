import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const carIcon = new L.DivIcon({
  html: '🚗',
  className: 'leaflet-div-icon',
  iconSize: [24,24],
  iconAnchor: [12,24]
});

export default function VehicleMap({ vehicleId }) {
  const [positions, setPositions] = React.useState([]);
  React.useEffect(()=>{
    fetchPositions(); // implementa fetch /history
    const socket = require('socket.io-client')(process.env.REACT_APP_API);
    socket.emit('joinVehicle', vehicleId);
    socket.on('newTelemetry',({point})=>{
      setPositions(p=>[...p,point]);
    });
    return ()=>socket.disconnect();
  },[]);

  // ...
  return (
    <MapContainer center={[0,0]} zoom={13} style={{ height:'80vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions.map(p=>[p.lat,p.lng])} />
      {positions.map((p,i)=>(
        <Marker key={i} position={[p.lat,p.lng]} icon={carIcon}>
          <Popup>
            {/* ... */}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
