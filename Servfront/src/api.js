// src/api.js
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

const api = axios.create({
  baseURL: API + '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Se houver token armazenado, já aplica no axios
const stored = typeof window !== 'undefined' && localStorage.getItem('auth');
if (stored) {
  const { token } = JSON.parse(stored);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
