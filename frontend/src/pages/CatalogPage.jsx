import { useCallback, useEffect, useState } from 'react';
import { getError } from '../api/client.js';
import { create, detail, list, remove, update } from '../services/inventarioService.js';
import Feedback from '../components/Feedback.jsx';

const configs = {
  categorias: { title: 'Categorías', singular: 'categoría', fields: [
    ['nombre', 'Nombre', 'text', true, 100], ['descripcion', 'Descripción', 'textarea'], ['activo', 'Activo', 'checkbox'],
  ] },
  proveedores: { title: 'Proveedores', singular: 'proveedor', fields: [
    ['nombre', 'Nombre', 'text', true, 150], ['identificacion', 'Identificación', 'text', true, 50],
    ['telefono', 'Teléfono', 'tel', true, 30], ['correo', 'Correo', 'email', true],
    ['direccion', 'Dirección', 'textarea'], ['activo', 'Activo', 'checkbox'],
  ] },
  ubicaciones: { title: 'Ubicaciones', singular: 'ubicación', fields: [
    ['nombre', 'Nombre', 'text', true, 100], ['descripcion', 'Descripción', 'textarea'], ['activo', 'Activo', 'checkbox'],
  ] },
};

function blank(fields) {
  return Object.fromEntries(fields.map(([name, , type]) => [name, type === 'checkbox' ? true : '']));
}

export default function CatalogPage({ resource }) {
  const config = configs[resource];
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(() => blank(config.fields));
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setRecords(await list(resource)); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, [resource]);

  useEffect(() => { reload(); }, [reload]);

  function startEdit(record) {
    setEditing(record.id);
    setForm(Object.fromEntries(config.fields.map(([name, , type]) => [name, record[name] ?? (type === 'checkbox' ? true : '')])));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditing(null);
    setForm(blank(config.fields));
  }

  async function save(event) {
    event.preventDefault();
    setError(''); setSuccess('');
    const payload = { ...form };
    for (const [name, , , required] of config.fields) {
      if (typeof payload[name] === 'string') payload[name] = payload[name].trim();
      if (required && !payload[name]) { setError(`Complete el campo ${name}.`); return; }
    }
    setSaving(true);
    try {
      if (editing) await update(resource, editing, payload);
      else await create(resource, payload);
      const wasEditing = Boolean(editing);
      reset();
      await reload();
      setSuccess(`${config.singular} ${wasEditing ? 'actualizada' : 'registrada'} correctamente.`);
    } catch (e) { setError(getError(e)); }
    finally { setSaving(false); }
  }

  async function show(record) {
    setError('');
    try { setSelected(await detail(resource, record.id)); }
    catch (e) { setError(getError(e)); }
  }

  async function erase(record) {
    if (!window.confirm(`¿Eliminar ${config.singular} "${record.nombre}"?`)) return;
    setError(''); setSuccess('');
    try {
      await remove(resource, record.id);
      if (editing === record.id) reset();
      if (selected?.id === record.id) setSelected(null);
      await reload();
      setSuccess(`${config.singular} eliminada correctamente.`);
    } catch (e) { setError(getError(e)); }
  }

  return <>
    <div className="mb-4"><p className="eyebrow mb-1">ADMINISTRACIÓN / CATÁLOGOS</p>
      <h1 className="h2 fw-bold mb-1">{config.title}</h1>
      <p className="text-secondary mb-0">Consulta y administra {config.title.toLowerCase()} del inventario.</p>
    </div>
    <Feedback error={error} success={success} />
    <section className="card border-0 shadow-sm mb-4"><div className="card-body p-4">
      <h2 className="h5 fw-bold mb-3">{editing ? `Editar ${config.singular} #${editing}` : `Registrar ${config.singular}`}</h2>
      <form onSubmit={save}><div className="row g-3">
        {config.fields.map(([name, label, type, required, maxLength]) => <div key={name} className={type === 'textarea' ? 'col-12' : 'col-md-6'}>
          {type === 'checkbox' ? <div className="form-check mt-4">
            <input id={`${resource}-${name}`} type="checkbox" className="form-check-input" checked={Boolean(form[name])} onChange={(e) => setForm({ ...form, [name]: e.target.checked })} />
            <label className="form-check-label" htmlFor={`${resource}-${name}`}>{label}</label>
          </div> : <><label className="form-label" htmlFor={`${resource}-${name}`}>{label}{required ? ' *' : ''}</label>
            {type === 'textarea' ? <textarea id={`${resource}-${name}`} className="form-control" value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} rows="2" />
              : <input id={`${resource}-${name}`} type={type} className="form-control" value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={Boolean(required)} maxLength={maxLength} />}</>}
        </div>)}
      </div><div className="d-flex gap-2 mt-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar'}</button>
        {editing && <button type="button" className="btn btn-outline-secondary" onClick={reset} disabled={saving}>Cancelar</button>}
      </div></form>
    </div></section>
    <section className="card border-0 shadow-sm"><div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3"><h2 className="h5 fw-bold mb-0">Listado ({records.length})</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={reload} disabled={loading}>Actualizar</button></div>
      {loading ? <p className="text-secondary">Cargando...</p> : <div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-light"><tr><th>ID</th><th>Nombre</th>{resource === 'proveedores' && <th>Identificación</th>}<th>Estado</th><th className="text-end">Acciones</th></tr></thead>
        <tbody>{records.length === 0 ? <tr><td colSpan={resource === 'proveedores' ? 5 : 4} className="text-center text-secondary py-4">No hay registros para mostrar.</td></tr>
          : records.map((record) => <tr key={record.id}><td>#{record.id}</td><td className="fw-semibold">{record.nombre}</td>
            {resource === 'proveedores' && <td>{record.identificacion}</td>}
            <td><span className={`badge ${record.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>{record.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td className="text-end"><div className="d-flex justify-content-end gap-1 flex-wrap">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => show(record)}>Ver</button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(record)}>Editar</button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => erase(record)}>Eliminar</button>
            </div></td></tr>)}</tbody>
      </table></div>}
    </div></section>
    {selected && <div className="card border-0 shadow-sm mt-4"><div className="card-body p-4">
      <div className="d-flex justify-content-between"><h2 className="h5">Detalle #{selected.id}</h2><button className="btn-close" aria-label="Cerrar detalle" onClick={() => setSelected(null)} /></div>
      <dl className="row mb-0">{config.fields.map(([name, label]) => <div key={name} className="col-md-6 mb-2"><dt>{label}</dt><dd>{typeof selected[name] === 'boolean' ? (selected[name] ? 'Sí' : 'No') : selected[name] || '—'}</dd></div>)}</dl>
    </div></div>}
  </>;
}
