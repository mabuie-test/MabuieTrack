import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

import LoginPage      from './pages/Login';
import Home           from './pages/Home';
import AdminUsers     from './pages/AdminUsers';
import AdminVehicles  from './pages/AdminVehicles';
import UserPage       from './pages/User';
import MapPage        from './pages/Map';

function Private({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Private><Home/></Private>} />
      <Route path="/admin/users"    element={<Private><AdminUsers/></Private>} />
      <Route path="/admin/vehicles" element={<Private><AdminVehicles/></Private>} />
      <Route path="/user"           element={<Private><UserPage/></Private>} />
      <Route path="/map/:id"        element={<Private><MapPage/></Private>} />
      <Route path="*"               element={<Navigate to="/" />} />
    </Routes>
  );
}
