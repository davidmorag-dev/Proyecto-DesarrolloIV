# Sistema de Control de Inventarios

API REST de Desarrollo de Software IV, construida con Django, Django REST Framework y MySQL. Incluye categorías, proveedores, ubicaciones, productos, movimientos de inventario y un reporte de stock bajo.

## Requisitos

- Python 3.14 y `pip`.
- MySQL 8 en ejecución y una cuenta con acceso a la base del proyecto.
- Las dependencias de `requirements.txt` (incluye el conector `mysqlclient`).
- Postman o Postman CLI para ejecutar la colección de ejemplos.

## Instalación

Desde la raíz del proyecto, en PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

En otros sistemas, activa el entorno virtual con el comando correspondiente y usa `python` en lugar de `py`.

## Base de datos MySQL

En una sesión administrativa de MySQL, crea la base y una cuenta exclusiva del proyecto. Sustituye la contraseña de ejemplo por una propia y conserva esa contraseña solo en tu `.env` local:

```sql
CREATE DATABASE control_inventarios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'control_inventarios_user'@'127.0.0.1' IDENTIFIED BY 'CAMBIAR_ESTA_CLAVE';
GRANT ALL PRIVILEGES ON control_inventarios_db.* TO 'control_inventarios_user'@'127.0.0.1';
```

Si la base y el usuario ya existen, utiliza los existentes: no vuelvas a crearlos. Copia `.env.example` a `.env` en la raíz y configura `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` y `DB_PORT` con los valores de tu instancia. `.env` está ignorado por Git. Si `DB_NAME` está vacío, `backend/settings.py` selecciona SQLite para desarrollo; **no** cambia automáticamente a SQLite cuando falla MySQL.

Comprueba la conexión y aplica las migraciones pendientes:

```powershell
py manage.py check --database default
py manage.py showmigrations
py manage.py migrate
```

## Usuarios y permisos

Crea un superusuario local para entrar en `/admin/`:

```powershell
py manage.py createsuperuser
```

La API reconoce tres grupos de Django: `Administrador` (CRUD de catálogos/productos y registro de movimientos), `Operador` (lectura, creación y edición sin borrado) y `Consulta` (solo lectura). Los movimientos no admiten edición ni borrado. Crea o asigna estos grupos y usuarios desde Django Admin; los nombres del grupo determinan los permisos de la API. La matriz completa está en `Documento_Tecnico_Final_Control_Inventarios.docx`.

## Iniciar el servidor y probar la API

```powershell
py manage.py runserver
```

Abre `http://127.0.0.1:8000/admin/`. Para obtener un token envía `POST /api/token/` con `username` y `password`; en las demás peticiones usa `Authorization: Token <token>`.

Rutas principales: `/api/categorias/`, `/api/proveedores/`, `/api/ubicaciones/`, `/api/productos/`, `/api/movimientos/` y `/api/reportes/stock-bajo/`. Productos y movimientos tienen filtros y paginación. La colección `ControlInventariosPruebas.json` y el entorno `ControlInventarios.postman_environment.json` contienen ejemplos; rellena las credenciales solo en tu entorno local, sin versionarlas.

## Pruebas automatizadas

```powershell
py manage.py test
```

Django crea y elimina una base de pruebas independiente. Con MySQL, la cuenta utilizada para ejecutar la suite necesita permiso para crear y eliminar esa base temporal. Si el usuario del proyecto solo tiene permisos sobre `control_inventarios_db`, ejecuta las pruebas con una cuenta administrativa local mediante variables `DB_USER` y `DB_PASSWORD` del proceso; no agregues esas credenciales al repositorio. La suite no modifica los datos de demostración de la base principal.

## Limitaciones conocidas

- El stock es global por producto y cada producto tiene una ubicación actual; no se administra stock separado por múltiples bodegas.
- Los movimientos son inmutables. Una corrección de inventario requiere un nuevo movimiento, nunca editar o borrar el historial.
- Los grupos de Django deben existir y asignarse a usuarios para usar los perfiles; un usuario autenticado sin grupo solo puede consultar.
- La colección Postman crea datos durante la ejecución. Úsala en una base de pruebas o limpia después los registros temporales generados por esa ejecución.
