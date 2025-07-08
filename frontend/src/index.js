import React from 'react';
import ReactDOM from 'react-dom/client';
// altera aqui
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
//import './index.css'; // se quiseres algum CSS global

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    {/* usa HashRouter em vez de BrowserRouter */}
    <HashRouter>
      <App />
    </HashRouter>
  </AuthProvider>
);
