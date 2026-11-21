# Sistema de Control de Inventarios

Este es el frontend del Proyecto II. Lo hicimos con React, Vite, JavaScript, React Router y Bootstrap 5 para usar la API de Django del Proyecto I. Permite manejar categorías, proveedores, ubicaciones, productos y movimientos. El dashboard, los listados y el stock salen de la base de datos; no usamos datos simulados en la aplicación.

**Ojo con las ramas:** el frontend está en `fronted` y el backend en [`main`](https://github.com/davidmorag-dev/Proyecto-DesarrolloIV/tree/main). Para correrlos juntos, ocupás las dos carpetas. No fusionés `fronted` directamente con `main`, porque las ramas se separaron para este proyecto.

## Qué ocupás

- Git, Python 3.14, Node.js 20.19+ o 22.12+ y npm.
- Una base de datos: SQLite para probar localmente o MySQL 8 según el [README del backend](https://github.com/davidmorag-dev/Proyecto-DesarrolloIV/blob/main/README.md).

## Instalación y ejecución

Si todavía no tenés las dos ramas en tu compu, podés bajarlas en carpetas separadas:

```powershell
git clone --branch main https://github.com/davidmorag-dev/Proyecto-DesarrolloIV.git Proyecto-DesarrolloIV
git clone --branch fronted https://github.com/davidmorag-dev/Proyecto-DesarrolloIV.git Proyecto-DesarrolloIV-fronted
```

En una terminal, entrá a `Proyecto-DesarrolloIV` y prepará Django. Sin `.env` en el backend se usa SQLite local. Si vas a usar MySQL, **antes de `migrate`** copiá el `.env.example` del backend, poné los datos reales de tu base y seguí su README. Las contraseñas van solo en tu `.env` local.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

Si querés datos de demostración, ejecutá `python manage.py seed_demo` antes de encender el servidor; ese comando requiere un superusuario llamado `Davox`. Después, arrancá Django con `python manage.py runserver 127.0.0.1:8000`.

En otra terminal, entrá a `Proyecto-DesarrolloIV-fronted\frontend`:

```powershell
copy .env.example .env
npm install
npm run dev
```

Abrí la dirección que muestre Vite, normalmente `http://localhost:5173/login`. Para administrar cuentas y grupos, usá `http://127.0.0.1:8000/admin/`. `npm run build` comprueba que el frontend compila.

## Conexión y CORS

El `.env.example` del frontend pone `VITE_API_URL=/api` y `VITE_BACKEND_URL=http://127.0.0.1:8000`. Vite manda las peticiones `/api` a Django mediante su proxy, así que **al correrlo con `npm run dev` no hace falta configurar CORS**. Si Django usa otro puerto, cambiá `VITE_BACKEND_URL` en tu `.env` y reiniciá Vite. Si el frontend se sirve desde otro origen sin ese proxy, hay que permitir ese origen en la configuración CORS de Django; el backend actual no lo trae configurado.

## Usuarios y permisos

Para probar en una base nueva, podés crear usuarios **ficticios** como `admin_demo`, `operador_demo`, `proveedor_demo` y `consulta_demo`, y crear/asignarles el grupo correspondiente desde Django Admin. Son nombres de ejemplo: no se crean automáticamente ni tienen contraseña predefinida. En nuestra base SQLite local usamos `Davox` (superusuario), `Herlin` (Proveedor) y `Vladimir` (Consulta); en otra computadora esas cuentas pueden no existir.

| Perfil | Qué puede hacer |
| --- | --- |
| Administrador o superusuario | Consultar, crear, editar y eliminar categorías, proveedores, ubicaciones y productos; registrar entradas y salidas. |
| Operador | Consultar, crear y editar esos cuatro módulos; registrar entradas y salidas. No puede eliminar. |
| Proveedor | Consultar todo; crear y editar proveedores. No puede eliminar ni registrar movimientos. |
| Consulta | Solo consultar. |

El login usa un token real. Si no hay sesión, la interfaz manda al login; Django responde `401` sin token y `403` cuando una cuenta no tiene permiso. El frontend muestra el error `403`. Como la API no devuelve el grupo del usuario, los botones se siguen mostrando aunque alguna acción esté prohibida.

## Reglas y límites

El stock inicia en cero y cambia con movimientos. Una entrada necesita un proveedor activo asociado al producto; una salida no puede superar el stock disponible. Los movimientos no se editan ni se borran. Tampoco se pueden borrar registros que tengan relaciones protegidas. El stock es global por producto, no por varias bodegas. Al cerrar sesión se borra el token del navegador, pero el backend no tiene un endpoint para revocarlo.

Para revisar qué pantalla llama a cada endpoint, mirá la [matriz de pantallas y API](docs/MATRIZ.md). La [lista de escenarios manuales](docs/ESCENARIOS.md) indica qué probar; hay que registrar los resultados y tomar capturas reales para la entrega.
