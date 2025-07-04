import { useRouter } from 'next/router';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import api from '../../api';

const VehicleMap = dynamic(() => import('../../components/VehicleMap'), { ssr: false });

export default function MapPage() {
  const { query } = useRouter();
  const id = query.id;
  const { data, error } = useSWR(
    () => id ? `/vehicles/history?range=day` : null,
    url => api.get(url).then(r => r.data)
  );

  if (error) return <p>Erro ao carregar posições.</p>;
  if (!data)  return <p>Carregando…</p>;

  return (
    <div style={{ padding:'1rem' }}>
      <h1>Trajecto Diário</h1>
      <VehicleMap positions={data.map(p=>({...p,lat:p.lat,lng:p.lng}))} />
    </div>
  );
}
