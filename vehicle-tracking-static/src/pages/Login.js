import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');

  const submit = async e => {
    e.preventDefault();
    try { await login(email, password); }
    catch { alert('Credenciais inválidas'); }
  };

  return (
    <div style={{ maxWidth:320, margin:'2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email"
          value={email} onChange={e=>setEmail(e.target.value)}
          style={{ width:'100%', margin:'0.5rem 0' }}/>
        <input type="password" placeholder="Password"
          value={password} onChange={e=>setPass(e.target.value)}
          style={{ width:'100%', margin:'0.5rem 0' }}/>
        <button type="submit" style={{ width:'100%' }}>Entrar</button>
      </form>
    </div>
  );
}
