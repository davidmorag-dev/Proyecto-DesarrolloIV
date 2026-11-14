import { createContext, useContext, useEffect, useState } from 'react';
import { api, getError } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('inventario_token'));
  const [username, setUsername] = useState(() => sessionStorage.getItem('inventario_username') || '');
  const [sessionExpired, setSessionExpired] = useState(false);

  function logout() {
    sessionStorage.removeItem('inventario_token');
    sessionStorage.removeItem('inventario_username');
    setToken(null);
    setUsername('');
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && sessionStorage.getItem('inventario_token')) {
          logout();
          setSessionExpired(true);
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  async function login(usernameInput, password) {
    try {
      const { data } = await api.post('/token/', { username: usernameInput, password });
      if (!data?.token) throw new Error('El servidor no devolvió un token.');
      sessionStorage.setItem('inventario_token', data.token);
      sessionStorage.setItem('inventario_username', usernameInput);
      setToken(data.token);
      setUsername(usernameInput);
      setSessionExpired(false);
    } catch (error) {
      throw new Error(error.response ? getError(error) : error.message);
    }
  }

  return <AuthContext.Provider value={{ token, username, login, logout, sessionExpired, isAuthenticated: Boolean(token) }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
