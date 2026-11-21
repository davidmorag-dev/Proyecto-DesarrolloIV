# Matriz de pantallas y endpoints

Todas las rutas API, excepto `/api/token/`, requieren `Authorization: Token <token>`.

| Pantalla / acción | Método y ruta | Parámetros o cuerpo | Respuesta y errores clave |
| --- | --- | --- | --- |
| Login | `POST /api/token/` | `username`, `password` | `token`; credenciales inválidas: 400 |
| Dashboard: total productos | `GET /api/productos/` | `page=1` | `total_registros` |
| Dashboard: total movimientos | `GET /api/movimientos/` | `page=1` | `total_registros` |
| Dashboard: stock bajo | `GET /api/reportes/stock-bajo/` | — | `total_registros`, `resultados` |
| Categorías: listar/crear | `GET`, `POST /api/categorias/` | Campos `nombre`, `descripcion`, `activo` en POST | Arreglo o registro; 403/400 |
| Categorías: ver/editar/borrar | `GET`, `PUT`, `DELETE /api/categorias/<id>/` | Campos del registro en PUT | Registro, 204; 404/403/409 |
| Proveedores: listar/crear | `GET`, `POST /api/proveedores/` | `nombre`, `identificacion`, `telefono`, `correo`, `direccion`, `activo` | Arreglo o registro; 403/400 |
| Proveedores: ver/editar/borrar | `GET`, `PUT`, `DELETE /api/proveedores/<id>/` | Campos del registro en PUT | Registro, 204; 404/403/409 |
| Ubicaciones: listar/crear | `GET`, `POST /api/ubicaciones/` | `nombre`, `descripcion`, `activo` | Arreglo o registro; 403/400 |
| Ubicaciones: ver/editar/borrar | `GET`, `PUT`, `DELETE /api/ubicaciones/<id>/` | Campos del registro en PUT | Registro, 204; 404/403/409 |
| Productos: listar, buscar, filtrar, ordenar, paginar | `GET /api/productos/` | `page`, `buscar`, `categoria`, `ubicacion`, `proveedor`, `activo`, `ordenar` | `pagina_actual`, `total_paginas`, `total_registros`, `resultados`; filtros inválidos: 400 |
| Productos: crear | `POST /api/productos/` | Código, nombre, descripción, IDs de categoría/ubicación/proveedores, precio, stock mínimo, activo | Producto; 400/403 |
| Productos: ver/editar/borrar | `GET`, `PUT`, `DELETE /api/productos/<id>/` | Campos editables en PUT; stock actual no editable | Producto, 204; 404/403/409 |
| Movimientos: historial, filtros y páginas | `GET /api/movimientos/` | `page`, `producto` (código), `usuario` (username), `tipo` | Respuesta paginada |
| Movimientos: registrar | `POST /api/movimientos/` | ID de producto, `ENTRADA`/`SALIDA`, cantidad, proveedor solo para entrada, observación | Movimiento y stocks; 400/403/409 |
| Movimientos: ver | `GET /api/movimientos/<id>/` | — | Movimiento; 404 |

Los selectores de formularios consultan `GET /api/categorias/`, `GET /api/ubicaciones/`, `GET /api/proveedores/` y todas las páginas de `GET /api/productos/` cuando se registra un movimiento. Las categorías, ubicaciones y proveedores no tienen paginación de servidor. `PATCH` también está disponible en los cuatro CRUD, aunque esta interfaz usa `PUT` con todos los campos.
