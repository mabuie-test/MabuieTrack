import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';

// Carrega os componentes que usam Leaflet apenas no cliente
const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage({ vehicleId, initialGeo }) {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />

      <VehicleControls vehicleId={vehicleId} />

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
        </>
      )}
    </div>
  );
}

// Garante que o Next.js não tenta exportar esta rota como estática
export async function getServerSideProps({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/api/vehicles/${params.id}`
  );
  if (!res.ok) {
    return { notFound: true };
  }
  const vehicle = await res.json();
  return {
    props: {
      vehicleId:    params.id,
      initialGeo:   vehicle.geofence || null
    }
  };
}
