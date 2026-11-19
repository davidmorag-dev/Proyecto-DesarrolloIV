import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const links = [
  ['dashboard', 'Dashboard', 'bi-speedometer2'],
  ['categorias', 'Categorías', 'bi-tags'],
  ['proveedores', 'Proveedores', 'bi-truck'],
  ['ubicaciones', 'Ubicaciones', 'bi-geo-alt'],
  ['productos', 'Productos', 'bi-box-seam'],
  ['movimientos', 'Movimientos', 'bi-arrow-left-right'],
];

export default function AppLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  function exit() {
    logout();
    navigate('/login', { replace: true });
  }
  return <div className="app-shell">
    <aside className="app-sidebar">
      <div className="sidebar-brand"><i className="bi bi-boxes me-2" />Sistema de Control de Inventarios</div>
      <p className="sidebar-label">ADMINISTRACIÓN</p>
      <nav className="nav flex-column gap-2" aria-label="Menú principal">
        {links.map(([path, label, icon]) => <NavLink key={path} to={`/${path}`} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className={`bi ${icon}`} />{label}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">React + Django API</div>
    </aside>
    <div className="app-main">
      <header className="app-topbar">
        <span className="d-md-none fw-bold text-primary"><i className="bi bi-boxes me-2" />Inventarios</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="small text-secondary"><i className="bi bi-person-circle me-2" />{username}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={exit}>Salir</button>
        </div>
      </header>
      <nav className="mobile-links d-md-none px-3 pt-3 d-flex gap-2" aria-label="Menú móvil">
        {links.map(([path, label]) => <NavLink key={path} to={`/${path}`} className="btn btn-outline-primary btn-sm">{label}</NavLink>)}
      </nav>
      <main className="container-fluid p-3 p-md-4 p-lg-5"><Outlet /></main>
    </div>
  </div>;
}
