import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = axios.create({ baseURL, timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('inventario_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export function getError(error) {
  if (!error.response) return 'No se puede conectar con Django. Compruebe que el servidor esté encendido.';
  const { status, data } = error.response;
  if (status === 401) return 'La sesión no es válida. Inicie sesión nuevamente.';
  if (status === 403) return data?.detail || 'Su perfil no permite realizar esta operación.';
  if (status === 404) return data?.error || 'El registro solicitado no existe.';
  if (status === 409) return data?.detail || formatFields(data) || 'La operación entra en conflicto con los datos actuales.';
  return data?.detail || data?.error || formatFields(data) || `Error HTTP ${status}`;
}

function formatFields(data) {
  if (!data || typeof data !== 'object') return typeof data === 'string' ? data : '';
  return Object.entries(data)
    .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
    .join(' · ');
}
