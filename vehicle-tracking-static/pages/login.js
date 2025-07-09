import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');

  const handle = async e => {
    e.preventDefault();
    try {
      await login(email, pw);
    } catch {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handle} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={pw}
          onChange={e => setPw(e.target.value)}
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}
