// pages/login.js
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
    <div style={{ maxWidth: 320, margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', margin: '0.5rem 0' }}
        />
        <input
          type="password" placeholder="Password"
          value={pw} onChange={e => setPw(e.target.value)}
          style={{ width:'100%', margin: '0.5rem 0' }}
        />
        <button type="submit" style={{ width:'100%' }}>Entrar</button>
      </form>
    </div>
  );
}
// Força SSR nesta rota dinâmica
export async function getServerSideProps() {
  return { props: {} };
    }
