import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';
import GeofenceEditor  from '../../src/components/GeofenceEditor';

// Carrega o mapa sem SSR
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
  { ssr: false }
);

export default function MapPage() {
  const { query } = useRouter();
  const { user }  = useContext(AuthContext);
  const vehicleId = query.id;

  if (!vehicleId) return <p>Carregando…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />

      <VehicleControls vehicleId={vehicleId} />

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} />
        </>
      )}
    </div>
  );
}
