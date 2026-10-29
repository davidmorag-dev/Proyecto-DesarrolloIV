# Sistema de Control de Inventarios

Backend del proyecto de Desarrollo de Software IV, creado con Django y Django REST Framework.

## Preparación

1. Crear y activar un entorno virtual.
2. Instalar dependencias con `pip install -r requirements.txt`.
3. Copiar `.env.example` como `.env` y completar los datos de MySQL. Si no se configura `DB_NAME`, el proyecto usa SQLite para desarrollo.
4. Ejecutar `python manage.py migrate`.
5. Crear usuarios, grupos `Administrador`, `Operador` y `Consulta`, y sus tokens desde Django Admin.

## Rutas principales

- `/api/token/`
- `/api/categorias/`
- `/api/proveedores/`
- `/api/ubicaciones/`
- `/api/productos/`
- `/api/movimientos/`
- `/api/reportes/stock-bajo/`
