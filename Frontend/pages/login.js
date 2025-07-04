import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pw, setPw]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, pw);
    } catch {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: 'auto', padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <input
          type="password" placeholder="Password"
          value={pw} onChange={e => setPw(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ width: '100%' }}>Entrar</button>
      </form>
    </div>
  );
}
