import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Carrega o component sem SSR
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
  { ssr: false }
);

export default function MapPage() {
  const { query } = useRouter();
  const vehicleId = query.id;

  if (!vehicleId) {
    return <p>Carregando…</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />
    </div>
  );
}
