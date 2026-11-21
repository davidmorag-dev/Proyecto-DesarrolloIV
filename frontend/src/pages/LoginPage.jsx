import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="card login-card shadow-lg border-0">
        <div className="login-art">
          <img
            src="/images/inventario-login.png"
            alt="Bodega organizada con cajas y una tableta de control de inventarios"
          />
        </div>

        <div className="card-body login-content p-4 p-md-5">
          <div className="brand-icon"><i className="bi bi-boxes" /></div>
          <h1 className="h3 fw-bold text-center">Sistema de Control de Inventarios</h1>
          <p className="text-secondary text-center mb-4">Inicio de sesión</p>

          {sessionExpired && (
            <div className="alert alert-warning" role="alert">
              La sesión expiró o el token dejó de ser válido.
            </div>
          )}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Usuario</label>
              <input
                id="username"
                className="form-control form-control-lg"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-control form-control-lg"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-secondary small mt-4 mb-0">
            Autenticación con Django REST Framework
          </p>
        </div>
      </div>
    </main>
  );
}
