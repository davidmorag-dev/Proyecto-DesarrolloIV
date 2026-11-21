import { useEffect, useState } from 'react';

const initial = { codigo: '', nombre: '', descripcion: '', categoria: '', ubicacion: '', proveedores: [], precio: '', stock_minimo: 0, activo: true };

export default function ProductoForm({ product, categories, locations, suppliers, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [validation, setValidation] = useState('');

  useEffect(() => {
    setForm(product ? {
      codigo: product.codigo, nombre: product.nombre, descripcion: product.descripcion,
      categoria: String(product.categoria), ubicacion: String(product.ubicacion),
      proveedores: product.proveedores || [], precio: product.precio,
      stock_minimo: product.stock_minimo, activo: product.activo,
    } : initial);
    setValidation('');
  }, [product]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function changeSuppliers(event) {
    const ids = Array.from(event.target.selectedOptions, (option) => Number(option.value));
    setForm((current) => ({ ...current, proveedores: ids }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.categoria || !form.ubicacion) {
      setValidation('Complete código, nombre, categoría y ubicación.'); return;
    }
    if (Number(form.precio) <= 0 || !Number.isInteger(Number(form.stock_minimo)) || Number(form.stock_minimo) < 0) {
      setValidation('El precio debe ser mayor que cero y el stock mínimo debe ser un entero no negativo.'); return;
    }
    setValidation('');
    const saved = await onSave({
      codigo: form.codigo.trim(), nombre: form.nombre.trim(), descripcion: form.descripcion.trim(),
      categoria: Number(form.categoria), ubicacion: Number(form.ubicacion), proveedores: form.proveedores,
      precio: form.precio, stock_minimo: Number(form.stock_minimo), activo: form.activo,
    });
    if (saved && !product) setForm(initial);
  }

  const categoryOptions = categories.filter((item) => item.activo || item.id === Number(form.categoria));
  const locationOptions = locations.filter((item) => item.activo || item.id === Number(form.ubicacion));

  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h5 fw-bold mb-3">
          {product ? `Editar producto #${product.id}` : 'Registrar producto'}
        </h2>

        {validation && (
          <div className="alert alert-warning" role="alert">{validation}</div>
        )}

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="codigo">Código *</label>
              <input
                id="codigo"
                name="codigo"
                className="form-control"
                maxLength="30"
                value={form.codigo}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-8">
              <label className="form-label" htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                className="form-control"
                maxLength="150"
                value={form.nombre}
                onChange={change}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-control"
                rows="2"
                value={form.descripcion}
                onChange={change}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                className="form-select"
                value={form.categoria}
                onChange={change}
                required
              >
                <option value="">Seleccione</option>
                {categoryOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}{item.activo ? '' : ' (inactiva)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ubicacion">Ubicación *</label>
              <select
                id="ubicacion"
                name="ubicacion"
                className="form-select"
                value={form.ubicacion}
                onChange={change}
                required
              >
                <option value="">Seleccione</option>
                {locationOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}{item.activo ? '' : ' (inactiva)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="proveedores">Proveedores asociados</label>
              <select
                id="proveedores"
                className="form-select"
                multiple
                size="4"
                value={form.proveedores.map(String)}
                onChange={changeSuppliers}
              >
                {suppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}{item.activo ? '' : ' (inactivo)'}
                  </option>
                ))}
              </select>
              <div className="form-text">Use Ctrl para seleccionar varios proveedores.</div>
            </div>

            <div className="col-md-3">
              <label className="form-label" htmlFor="precio">Precio *</label>
              <input
                id="precio"
                name="precio"
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                value={form.precio}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label" htmlFor="stock_minimo">Stock mínimo *</label>
              <input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step="1"
                className="form-control"
                value={form.stock_minimo}
                onChange={change}
                required
              />
              <div className="form-text">El stock actual se modifica con movimientos.</div>
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  id="activo"
                  name="activo"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.activo}
                  onChange={change}
                />
                <label htmlFor="activo" className="form-check-label">Activo</label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Registrar'}
            </button>
            {product && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={onCancel}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
