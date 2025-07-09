import { useState, useContext } from 'react';
import { AuthContext } from '../src/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, pw);
    } catch {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e=>setPw(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

