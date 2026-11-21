import { useCallback, useEffect, useState } from 'react';
import { getError } from '../api/client.js';
import { create, detail, list } from '../services/inventarioService.js';
import Feedback from '../components/Feedback.jsx';
import Pagination from '../components/Pagination.jsx';
import MovimientoForm from '../components/MovimientoForm.jsx';

const emptyFilters = { producto: '', usuario: '', tipo: '' };

async function allProducts() {
  const first = await list('productos', { page: 1 });
  const pages = await Promise.all(
    Array.from({ length: first.total_paginas - 1 }, (_, index) =>
      list('productos', { page: index + 2 })
    )
  );
  return [first, ...pages].flatMap((page) => page.resultados);
}

export default function Movimientos() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        ...Object.fromEntries(
          Object.entries(applied).filter(([, value]) => value !== '')
        ),
      };
      const data = await list('movimientos', params);
      setMovements(data.resultados);
      setTotalPages(data.total_paginas);
      setTotal(data.total_registros);
      setPage(data.pagina_actual);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadOptions = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([allProducts(), list('proveedores')]);
      setProducts(p);
      setSuppliers(s);
    } catch (e) {
      setError(getError(e));
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  async function save(payload) {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await create('movimientos', payload);
      await Promise.all([reload(), loadOptions()]);
      setSuccess('Movimiento registrado. El stock del producto fue actualizado.');
      return true;
    } catch (e) {
      setError(getError(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function show(movement) {
    setError('');
    try {
      setSelected(await detail('movimientos', movement.id));
    } catch (e) {
      setError(getError(e));
    }
  }

  function productName(id) {
    const p = products.find((item) => item.id === id);
    return p ? `${p.codigo} · ${p.nombre}` : `Producto #${id}`;
  }

  return (
    <>
      <div className="mb-4">
        <p className="eyebrow mb-1">ADMINISTRACIÓN / INVENTARIO</p>
        <h1 className="h2 fw-bold mb-1">Movimientos</h1>
        <p className="text-secondary mb-0">
          Entradas, salidas e historial de existencias.
        </p>
      </div>

      <Feedback error={error} success={success} />

      <MovimientoForm
        products={products}
        suppliers={suppliers}
        onSave={save}
        saving={saving}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">Historial ({total})</h2>

          <form
            className="row g-2 mb-3"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setApplied({ ...filters });
            }}
          >
            <div className="col-md-4">
              <label htmlFor="filter-producto" className="form-label">
                Código de producto
              </label>
              <input
                id="filter-producto"
                className="form-control"
                value={filters.producto}
                onChange={(e) => setFilters({ ...filters, producto: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="filter-usuario" className="form-label">
                Usuario
              </label>
              <input
                id="filter-usuario"
                className="form-control"
                value={filters.usuario}
                onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="filter-tipo" className="form-label">
                Tipo
              </label>
              <select
                id="filter-tipo"
                className="form-select"
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
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
            <p className="text-secondary">Cargando movimientos...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock anterior</th>
                    <th>Stock resultante</th>
                    <th>Usuario</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-secondary py-4">
                        No hay movimientos para mostrar.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id}>
                        <td>{new Date(m.fecha).toLocaleString('es-CR')}</td>
                        <td>{productName(m.producto)}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.tipo === 'ENTRADA'
                                ? 'text-bg-success'
                                : 'text-bg-warning'
                            }`}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td>{m.cantidad}</td>
                        <td>{m.stock_anterior}</td>
                        <td>{m.stock_resultante}</td>
                        <td>{m.usuario_nombre}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => show(m)}
                          >
                            Ver
                          </button>
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
              <h2 className="h5">Movimiento #{selected.id}</h2>
              <button
                className="btn-close"
                aria-label="Cerrar detalle"
                onClick={() => setSelected(null)}
              />
            </div>
            <p>
              {selected.tipo} de {selected.cantidad} unidades · {productName(selected.producto)}
            </p>
            <p>
              Stock: {selected.stock_anterior} → {selected.stock_resultante} · Usuario: {selected.usuario_nombre}
            </p>
            <p>
              Proveedor:{' '}
              {selected.proveedor
                ? suppliers.find((s) => s.id === selected.proveedor)?.nombre || `#${selected.proveedor}`
                : 'No aplica'}
            </p>
            <p className="mb-0">
              Observación: {selected.observacion || '—'}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
