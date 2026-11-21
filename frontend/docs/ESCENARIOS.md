# Escenarios manuales de integración

Ejecutar con Django y React activos, cuentas locales de prueba de `Administrador`, `Operador` y `Consulta`, y una base de pruebas. Anotar usuario ficticio, fecha, solicitud HTTP, resultado y captura real cuando corresponda. No publicar contraseñas ni tokens.

| Nº | Escenario | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir `/dashboard` sin sesión | Redirige al login. Una petición API sin token devuelve 401. |
| 2 | Iniciar sesión con una cuenta válida | Recibe token real, abre dashboard. |
| 3 | Intentar login con contraseña incorrecta | Muestra error, no crea sesión. |
| 4 | Consultar dashboard | Tres indicadores coinciden con respuestas reales de API. |
| 5 | Navegar por los cinco módulos | Carga datos reales sin recarga completa de página. |
| 6 | Crear una categoría como Administrador | Aparece en listado y detalle. |
| 7 | Editar la categoría | El detalle refleja el cambio. |
| 8 | Eliminar una categoría sin productos | Respuesta 204 y desaparece del listado. |
| 9 | Crear proveedor y ubicación; crear producto relacionado | Los selectores consultan API; producto muestra las relaciones. |
| 10 | Buscar, combinar filtros y ordenar productos | Cambia el listado completo mediante parámetros del backend. |
| 11 | Avanzar páginas de productos y movimientos | Muestra resultados y contadores de páginas del servidor. |
| 12 | Registrar entrada con proveedor asociado | Movimiento 201 y stock del producto aumenta. |
| 13 | Intentar salida mayor que el stock | Muestra 409; stock no cambia. |
| 14 | Registrar salida válida | Movimiento 201 y stock disminuye. |
| 15 | Intentar borrar producto con movimientos | Muestra 409 y conserva producto. |
| 16 | Como Operador, intentar eliminar un catálogo | Muestra 403. Crear o editar sí funciona. |
| 17 | Como Consulta, intentar crear producto o movimiento | Muestra 403; lectura sí funciona. |
| 18 | Cerrar sesión | Limpia token local, redirige al login. |

Capturas a conservar: login, dashboard, cada uno de los cinco módulos, formularios de producto y movimiento, filtros/paginación y al menos un error de validación o conflicto. Preparar un `.txt` con el enlace final al repositorio para la entrega en Mediación Virtual.
