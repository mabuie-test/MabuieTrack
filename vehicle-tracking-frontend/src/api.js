import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API||'http://localhost:5000') + '/api',
  headers: {'Content-Type':'application/json'}
});

export default api;

