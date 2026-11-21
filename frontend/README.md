# Sistema de Control de Inventarios — frontend

SPA de React, Vite, JavaScript, React Router y Bootstrap 5 para la API Django REST Framework del Proyecto I. Conserva los módulos de categorías, proveedores, ubicaciones, productos y movimientos. No usa datos simulados.

La interfaz toma la estructura del ejercicio GameArena de clase, pero utiliza una paleta verde, crema y terracota y dos ilustraciones originales de inventarios en `public/images/`. Las imágenes se generaron con la herramienta integrada imagegen: una bodega con tableta para el login y estanterías de inventario para el dashboard. No representan datos del sistema.

## Requisitos y ejecución

- Node.js 20.19+ o 22.12+ y npm.
- Backend del Proyecto I en `http://127.0.0.1:8000`, con sus migraciones, base de datos y usuarios configurados según su README.

```powershell
cd fronted-Completo
copy .env.example .env
npm install
npm run dev
```

Abrir la URL que muestre Vite (normalmente `http://localhost:5173`). `VITE_API_URL=/api` usa el proxy de `vite.config.js` hacia Django y evita CORS durante desarrollo. `VITE_BACKEND_URL` indica el origen de Django y puede cambiarse si se inicia en otro puerto. Si se sirve el frontend desde otro origen sin proxy, hay que configurar CORS en Django para ese origen. Estas variables no contienen secretos. Para verificar la compilación: `npm run build`. El proyecto usa la versión WebAssembly de Rollup para que la compilación funcione también en Windows cuando se bloquea la carga de módulos nativos.

## Sesión y perfiles

El login usa `POST /api/token/` con credenciales reales y guarda el token en `sessionStorage`. El cliente lo adjunta como `Authorization: Token ...`. Al salir se limpia la sesión local y se redirige al login. El backend actual no tiene revocación de token: el token sigue válido en el servidor hasta que se elimine o rote allí.

Las rutas privadas requieren una sesión local. Las respuestas 401 borran el token y llevan al login; las respuestas 403 muestran el permiso denegado. Django sigue siendo la autoridad para cada operación. El endpoint de token actual devuelve solo el token, y no existe un endpoint de perfil/grupos. Por eso la interfaz no puede distinguir de forma confiable `Administrador`, `Operador` y `Consulta` para ocultar acciones; muestra las acciones y comunica el 403 si el usuario no está autorizado. Un futuro endpoint `/api/perfil/` permitiría adaptar botones y rutas sin adivinar el rol. Los grupos se crean y asignan desde Django Admin.

| Perfil | Lectura | Crear/editar cuatro catálogos | Eliminar | Registrar movimiento |
| --- | --- | --- | --- | --- |
| Administrador (o superusuario) | Sí | Sí | Sí, si no hay relaciones protegidas | Sí |
| Operador | Sí | Sí | No | Sí |
| Consulta | Sí | No | No | No |

Los movimientos son inmutables; no existe edición ni eliminación por API. Los cuatro CRUD corresponden a categorías, proveedores, ubicaciones y productos.

## Datos y reglas

Los listados de productos y movimientos consumen filtros combinables y paginación del servidor. La búsqueda y el ordenamiento de productos también se ejecutan en Django. Los tres indicadores del dashboard usan `total_registros` real de productos, movimientos y reporte de stock bajo. El reporte actual incluye productos inactivos si están bajo su mínimo.

Un producto se crea con stock inicial cero. El stock cambia únicamente al registrar una entrada o salida. La entrada requiere proveedor activo asociado al producto; una salida no lleva proveedor y no puede superar el stock. El frontend comprueba campos básicos; Django mantiene las validaciones de negocio y devuelve errores 400 o 409. La eliminación de registros relacionados también puede devolver 409.

## Documentación y evidencias

- [Matriz de pantallas y endpoints](docs/MATRIZ.md)
- [Guía de 12 escenarios manuales](docs/ESCENARIOS.md)

Las capturas reales del login, dashboard, cinco módulos, formularios y errores deben tomarse durante la demostración con la API y la base de datos en ejecución. No se incluyen capturas fabricadas ni credenciales. Para demostrar los tres perfiles, preparar cuentas locales de prueba en Django Admin y registrar sus nombres de usuario ficticios en la evidencia sin publicar contraseñas.

## Ubicación y colaboración

Esta carpeta es una versión de trabajo independiente en `PROYECTOS/fronted-Completo`. No modifica el backend de `main` ni el worktree de la rama `fronted`. Para la entrega colaborativa, distribuir cambios entre las ramas `fronted-david`, `fronted-herlin` y `fronted-vladimir`, revisar los pull requests hacia `fronted` y trasladar el código aprobado a la carpeta `frontend/` de esa rama. No fusionar directamente `fronted` con `main`, porque la separación actual de ramas retiraría el backend.
