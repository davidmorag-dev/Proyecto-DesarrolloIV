import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getError } from '../api/client.js';
import { list, stockBajo } from '../services/inventarioService.js';

const modules = [
  ['categorias', 'Categorías', 'bi-tags'], ['proveedores', 'Proveedores', 'bi-truck'],
  ['ubicaciones', 'Ubicaciones', 'bi-geo-alt'], ['productos', 'Productos', 'bi-box-seam'],
  ['movimientos', 'Movimientos', 'bi-arrow-left-right'],
];

export default function Dashboard() {
  const { username } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([list('productos', { page: 1 }), list('movimientos', { page: 1 }), stockBajo()])
      .then(([products, movements, lowStock]) => {
        if (active) setData({ products: products.total_registros, movements: movements.total_registros, lowStock });
      })
      .catch((e) => { if (active) setError(getError(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const cards = data && [
    ['Productos', data.products, 'bi-box-seam', 'blue'],
    ['Movimientos', data.movements, 'bi-arrow-left-right', 'purple'],
    ['Stock bajo', data.lowStock.total_registros, 'bi-exclamation-triangle', 'orange'],
  ];

  return <>
    <div className="dashboard-banner mb-4">
      <img src="/images/inventario-dashboard.png" alt="" aria-hidden="true" />
      <div className="dashboard-banner-copy"><p className="eyebrow mb-1">PANEL GENERAL</p><h1 className="h2 fw-bold mb-2">Dashboard</h1><p className="mb-0">Bienvenido, {username}.<br />Tu inventario, siempre a la vista.</p></div>
    </div>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {loading ? <p className="text-secondary">Cargando indicadores...</p> : cards && <>
      <div className="row g-3 mb-4">{cards.map(([title, value, icon, tone]) => <div className="col-sm-6 col-xl-4" key={title}><div className="card border-0 shadow-sm h-100"><div className="card-body p-4 d-flex justify-content-between align-items-center"><div><p className="text-secondary small mb-2">{title}</p><h2 className="mb-0 fw-bold">{value}</h2></div><div className={`stat-icon ${tone}`}><i className={`bi ${icon}`} /></div></div></div></div>)}</div>
      <section className="card border-0 shadow-sm mb-4"><div className="card-body p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 fw-bold mb-0">Productos con stock bajo</h2><Link to="/productos" className="small text-decoration-none">Ver productos</Link></div>{data.lowStock.resultados.length === 0 ? <p className="text-secondary mb-0">No hay productos con stock bajo.</p> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Código</th><th>Nombre</th><th>Stock actual</th><th>Stock mínimo</th></tr></thead><tbody>{data.lowStock.resultados.slice(0, 5).map((p) => <tr key={p.id}><td>{p.codigo}</td><td>{p.nombre}</td><td>{p.stock_actual}</td><td>{p.stock_minimo}</td></tr>)}</tbody></table></div>}</div></section>
    </>}
    <section className="card border-0 shadow-sm"><div className="card-body p-4"><h2 className="h5 fw-bold mb-3">Módulos del sistema</h2><div className="row g-2">{modules.map(([path, label, icon]) => <div className="col-sm-6 col-lg-4" key={path}><Link to={`/${path}`} className="btn btn-outline-primary w-100 text-start"><i className={`bi ${icon} me-2`} />{label}</Link></div>)}</div></div></section>
  </>;
}
