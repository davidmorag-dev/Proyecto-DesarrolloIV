import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import Productos from './pages/Productos.jsx';
import Movimientos from './pages/Movimientos.jsx';

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/categorias" element={<CatalogPage key="categorias" resource="categorias" />} />
      <Route path="/proveedores" element={<CatalogPage key="proveedores" resource="proveedores" />} />
      <Route path="/ubicaciones" element={<CatalogPage key="ubicaciones" resource="ubicaciones" />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/movimientos" element={<Movimientos />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
