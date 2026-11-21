import { api } from '../api/client.js';

const resources = new Set(['categorias', 'proveedores', 'ubicaciones', 'productos', 'movimientos']);

function endpoint(resource, id) {
  if (!resources.has(resource)) throw new Error('Recurso desconocido.');
  return `/${resource}/${id ? `${id}/` : ''}`;
}

export async function list(resource, params) {
  const { data } = await api.get(endpoint(resource), { params });
  return data;
}

export async function detail(resource, id) {
  const { data } = await api.get(endpoint(resource, id));
  return data;
}

export async function create(resource, payload) {
  const { data } = await api.post(endpoint(resource), payload);
  return data;
}

export async function update(resource, id, payload) {
  const { data } = await api.put(endpoint(resource, id), payload);
  return data;
}

export async function remove(resource, id) {
  await api.delete(endpoint(resource, id));
}

export async function stockBajo() {
  const { data } = await api.get('/reportes/stock-bajo/');
  return data;
}
