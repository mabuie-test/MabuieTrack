import { AuthProvider } from '../src/contexts/AuthContext';
import 'leaflet/dist/leaflet.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
