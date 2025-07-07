import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';

// Dynamic imports (client‑only)
const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage({ vehicleId, initialGeo, fetchError }) {
  const { user } = useContext(AuthContext);

  if (fetchError) {
    return (
      <div style={{ padding:'1rem', color:'red' }}>
        <h1>Erro ao carregar dados do veículo</h1>
        <pre>{fetchError}</pre>
      </div>
    );
  }

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

export async function getServerSideProps({ params }) {
  const base = process.env.API_URL
            || process.env.NEXT_PUBLIC_API
            || 'http://localhost:5000';

  try {
    const res = await fetch(`${base}/api/vehicles/${params.id}`);
    if (res.status === 404) {
      return { notFound: true };
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    const vehicle = await res.json();
    return {
      props: {
        vehicleId:  params.id,
        initialGeo: vehicle.geofence || null,
        fetchError: null
      }
    };
  } catch (err) {
    console.error('Erro em getServerSideProps /map/[id]:', err);
    return {
      props: {
        vehicleId:  params.id,
        initialGeo: null,
        fetchError: err.message
      }
    };
  }
}
