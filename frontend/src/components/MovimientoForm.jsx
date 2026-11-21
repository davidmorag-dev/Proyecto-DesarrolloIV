import { useEffect, useState } from 'react';

const initial = {
  producto: '',
  tipo: 'ENTRADA',
  cantidad: '',
  proveedor: '',
  observacion: '',
};

export default function MovimientoForm({ products, suppliers, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const [validation, setValidation] = useState('');

  const product = products.find((item) => item.id === Number(form.producto));
  const allowedSuppliers = suppliers.filter(
    (item) => item.activo && product?.proveedores.includes(item.id)
  );

  useEffect(() => {
    if (form.tipo === 'SALIDA' && form.proveedor) {
      setForm((current) => ({ ...current, proveedor: '' }));
    }
  }, [form.tipo, form.proveedor]);

  async function submit(event) {
    event.preventDefault();

    if (!form.producto || !Number.isInteger(Number(form.cantidad)) || Number(form.cantidad) <= 0) {
      setValidation('Seleccione un producto e indique una cantidad entera mayor que cero.');
      return;
    }

    if (form.tipo === 'ENTRADA' && !form.proveedor) {
      setValidation('Las entradas requieren un proveedor asociado y activo.');
      return;
    }

    setValidation('');
    const saved = await onSave({
      producto: Number(form.producto),
      tipo: form.tipo,
      cantidad: Number(form.cantidad),
      ...(form.tipo === 'ENTRADA' ? { proveedor: Number(form.proveedor) } : {}),
      observacion: form.observacion.trim(),
    });

    if (saved) {
      setForm(initial);
    }
  }

  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h5 fw-bold mb-3">Registrar movimiento</h2>
        <p className="text-secondary small">
          Los movimientos no se editan ni se eliminan. El stock y el usuario los registra el servidor.
        </p>

        {validation && (
          <div className="alert alert-warning" role="alert">
            {validation}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="mov-producto" className="form-label">
                Producto *
              </label>
              <select
                id="mov-producto"
                className="form-select"
                value={form.producto}
                onChange={(e) => setForm({ ...form, producto: e.target.value, proveedor: '' })}
                required
              >
                <option value="">Seleccione</option>
                {products
                  .filter((p) => p.activo)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} · {p.nombre} (stock: {p.stock_actual})
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="mov-tipo" className="form-label">
                Tipo *
              </label>
              <select
                id="mov-tipo"
                className="form-select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value, proveedor: '' })}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="mov-cantidad" className="form-label">
                Cantidad *
              </label>
              <input
                id="mov-cantidad"
                type="number"
                min="1"
                step="1"
                className="form-control"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                required
              />
            </div>

            {form.tipo === 'ENTRADA' && (
              <div className="col-md-6">
                <label htmlFor="mov-proveedor" className="form-label">
                  Proveedor *
                </label>
                <select
                  id="mov-proveedor"
                  className="form-select"
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                  required
                >
                  <option value="">Seleccione</option>
                  {allowedSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
                {product && allowedSuppliers.length === 0 && (
                  <div className="form-text text-danger">
                    Este producto no tiene proveedores asociados y activos.
                  </div>
                )}
              </div>
            )}

            <div className="col-12">
              <label htmlFor="mov-observacion" className="form-label">
                Observación
              </label>
              <textarea
                id="mov-observacion"
                className="form-control"
                rows="2"
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              />
            </div>
          </div>

          <button className="btn btn-primary mt-3" disabled={saving}>
            {saving ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </section>
  );
}
