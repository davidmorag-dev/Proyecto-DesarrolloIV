import { useCallback, useEffect, useState } from 'react';
import { getError } from '../api/client.js';
import { create, detail, list, remove, update } from '../services/inventarioService.js';
import Feedback from '../components/Feedback.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductoForm from '../components/ProductoForm.jsx';

const emptyFilters = { buscar: '', categoria: '', ubicacion: '', proveedor: '', activo: '', ordenar: 'nombre' };

export default function Productos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, ...Object.fromEntries(Object.entries(applied).filter(([, value]) => value !== '')) };
      const data = await list('productos', params);
      setProducts(data.resultados);
      setTotalPages(data.total_paginas);
      setTotal(data.total_registros);
      setPage(data.pagina_actual);
    } catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, [page, applied]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    Promise.all([list('categorias'), list('ubicaciones'), list('proveedores')])
      .then(([c, u, p]) => { setCategories(c); setLocations(u); setSuppliers(p); })
      .catch((e) => setError(getError(e)));
  }, []);

  function apply(event) {
    event.preventDefault();
    setPage(1);
    setApplied({ ...filters });
  }

  async function save(payload) {
    setSaving(true); setError(''); setSuccess('');
    try {
      const wasEditing = Boolean(editing);
      if (editing) await update('productos', editing.id, payload);
      else await create('productos', payload);
      setEditing(null);
      await reload();
      setSuccess(`Producto ${wasEditing ? 'actualizado' : 'registrado'} correctamente.`);
      return true;
    } catch (e) { setError(getError(e)); return false; }
    finally { setSaving(false); }
  }

  async function show(product) {
    setError('');
    try { setSelected(await detail('productos', product.id)); }
    catch (e) { setError(getError(e)); }
  }

  async function erase(product) {
    if (!window.confirm(`¿Eliminar el producto "${product.nombre}"?`)) return;
    setError(''); setSuccess('');
    try {
      await remove('productos', product.id);
      if (selected?.id === product.id) setSelected(null);
      if (editing?.id === product.id) setEditing(null);
      if (products.length === 1 && page > 1) setPage(page - 1);
      else await reload();
      setSuccess('Producto eliminado correctamente.');
    } catch (e) { setError(getError(e)); }
  }

  const filterSelects = [
    ['categoria', 'Categoría', categories],
    ['ubicacion', 'Ubicación', locations],
    ['proveedor', 'Proveedor', suppliers],
  ];

  const sortOptions = [
    ['nombre', 'Nombre A–Z'],
    ['-nombre', 'Nombre Z–A'],
    ['codigo', 'Código A–Z'],
    ['-codigo', 'Código Z–A'],
    ['precio', 'Precio menor'],
    ['-precio', 'Precio mayor'],
    ['stock_actual', 'Stock menor'],
    ['-stock_actual', 'Stock mayor'],
  ];

  return (
    <>
      <div className="mb-4">
        <p className="eyebrow mb-1">ADMINISTRACIÓN / INVENTARIO</p>
        <h1 className="h2 fw-bold mb-1">Productos</h1>
        <p className="text-secondary mb-0">Catálogo, existencias y relaciones del inventario.</p>
      </div>

      <Feedback error={error} success={success} />

      <ProductoForm
        product={editing}
        categories={categories}
        locations={locations}
        suppliers={suppliers}
        onSave={save}
        onCancel={() => setEditing(null)}
        saving={saving}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">Listado de productos ({total})</h2>

          <form className="row g-2 mb-3" onSubmit={apply}>
            <div className="col-md-4">
              <label className="form-label" htmlFor="buscar">Buscar nombre o código</label>
              <input
                id="buscar"
                className="form-control"
                value={filters.buscar}
                onChange={(e) => setFilters({ ...filters, buscar: e.target.value })}
              />
            </div>

            {filterSelects.map(([key, label, options]) => (
              <div className="col-md-4" key={key}>
                <label className="form-label" htmlFor={`filter-${key}`}>{label}</label>
                <select
                  id={`filter-${key}`}
                  className="form-select"
                  value={filters[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                >
                  <option value="">Todos</option>
                  {options.map((item) => (
                    <option key={item.id} value={item.nombre}>{item.nombre}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="col-md-4">
              <label className="form-label" htmlFor="filter-activo">Estado</label>
              <select
                id="filter-activo"
                className="form-select"
                value={filters.activo}
                onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="filter-ordenar">Ordenar por</label>
              <select
                id="filter-ordenar"
                className="form-select"
                value={filters.ordenar}
                onChange={(e) => setFilters({ ...filters, ordenar: e.target.value })}
              >
                {sortOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary">Aplicar filtros</button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFilters(emptyFilters);
                  setApplied(emptyFilters);
                  setPage(1);
                }}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={reload}
                disabled={loading}
              >
                Actualizar
              </button>
            </div>
          </form>

          {loading ? (
            <p className="text-secondary">Cargando productos...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Ubicación</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-secondary py-4">
                        No hay productos para mostrar.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.codigo}</td>
                        <td className="fw-semibold">{product.nombre}</td>
                        <td>{product.categoria_nombre}</td>
                        <td>{product.ubicacion_nombre}</td>
                        <td>₡{product.precio}</td>
                        <td>
                          <span
                            className={
                              product.stock_actual <= product.stock_minimo
                                ? 'text-danger fw-bold'
                                : ''
                            }
                          >
                            {product.stock_actual}
                          </span>{' '}
                          / mín. {product.stock_minimo}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              product.activo ? 'text-bg-success' : 'text-bg-secondary'
                            }`}
                          >
                            {product.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end flex-wrap gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => show(product)}
                            >
                              Ver
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setEditing(product);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => erase(product)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </section>

      {selected && (
        <section className="card border-0 shadow-sm mt-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between">
              <h2 className="h5">Producto #{selected.id}: {selected.nombre}</h2>
              <button
                className="btn-close"
                aria-label="Cerrar detalle"
                onClick={() => setSelected(null)}
              />
            </div>
            <p className="mb-1">
              Código: {selected.codigo} · Precio: ₡{selected.precio} · Stock: {selected.stock_actual}
            </p>
            <p className="mb-1">
              Categoría: {selected.categoria_nombre} · Ubicación: {selected.ubicacion_nombre}
            </p>
            <p className="mb-1">
              Proveedores:{' '}
              {selected.proveedores
                .map((id) => suppliers.find((s) => s.id === id)?.nombre || `#${id}`)
                .join(', ') || 'Ninguno'}
            </p>
            <p className="mb-0">{selected.descripcion || 'Sin descripción'}</p>
          </div>
        </section>
      )}
    </>
  );
}
