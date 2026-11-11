"""Carga datos de demostración coherentes para el inventario local."""

from datetime import timedelta
from decimal import Decimal
from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from Categorias.models import Categoria
from Movimientos.models import MovimientoInventario
from Movimientos.serializers import MovimientoInventarioSerializer
from Productos.models import Producto
from Proveedores.models import Proveedor
from Ubicaciones.models import Ubicacion


CATEGORIAS = [
    ("Redes y conectividad", "Routers, switches y puntos de acceso para instalaciones pequeñas y medianas."),
    ("Cableado estructurado", "Cable, conectores y accesorios para enlaces de datos."),
    ("Almacenamiento", "Unidades para equipos de escritorio y portátiles."),
    ("Energía y respaldo", "UPS y protección eléctrica para equipos críticos."),
    ("Periféricos de trabajo", "Accesorios de uso diario para estaciones de trabajo."),
]

UBICACIONES = [
    ("Bodega central · San José", "Estantería de recepción y despacho, pasillo A."),
    ("Sala de ventas · La Sabana", "Existencias disponibles para entrega inmediata."),
    ("Reserva técnica · Heredia", "Equipos apartados para instalaciones y soporte."),
]

# Los proveedores y sus contactos son ficticios; el dominio .example evita correos reales.
PROVEEDORES = [
    ("Redes del Valle S.A.", "DEMO-CR-001", "0000-0001", "compras@redesdelvalle.example", "La Uruca, San José; entregas martes y jueves."),
    ("Cabletica Mayorista S.R.L.", "DEMO-CR-002", "0000-0002", "pedidos@cableticamayorista.example", "Pavas, San José; despacho de rollos y conectores."),
    ("Cómputo Central Distribución S.A.", "DEMO-CR-003", "0000-0003", "ventas@computocentral.example", "San Francisco de Dos Ríos; almacenamiento y periféricos."),
    ("Respaldo Eléctrico del Oeste S.A.", "DEMO-CR-004", "0000-0004", "ordenes@respaldooeste.example", "Escazú, San José; UPS y accesorios eléctricos."),
]

# Código, nombre, descripción, categoría, ubicación, precio CRC, mínimo, proveedores.
PRODUCTOS = [
    ("RED-RTR-001", "Router MikroTik hEX S", "Router de cinco puertos Gigabit con SFP; para sedes pequeñas.", "Redes y conectividad", "Bodega central · San José", "48900.00", 4, ["DEMO-CR-001"]),
    ("RED-SWT-002", "Switch TP-Link TL-SG108", "Switch no administrable de ocho puertos Gigabit para puestos de trabajo.", "Redes y conectividad", "Sala de ventas · La Sabana", "22900.00", 6, ["DEMO-CR-001"]),
    ("RED-AP-003", "Punto de acceso UniFi U6+", "Punto de acceso Wi-Fi 6 para cobertura de oficina y comercio.", "Redes y conectividad", "Reserva técnica · Heredia", "89900.00", 3, ["DEMO-CR-001"]),
    ("CAB-UTP-004", "Cable UTP Cat 6, rollo 305 m", "Rollo de cable de cobre para instalaciones interiores de red.", "Cableado estructurado", "Bodega central · San José", "76500.00", 3, ["DEMO-CR-002"]),
    ("CAB-RJ45-005", "Conectores RJ45 Cat 6, bolsa de 100", "Conectores modulares para terminaciones de cable Cat 6.", "Cableado estructurado", "Bodega central · San José", "12500.00", 8, ["DEMO-CR-002"]),
    ("ALM-SSD-006", "SSD NVMe Kingston NV3 1 TB", "Unidad M.2 PCIe para renovación de equipos de oficina.", "Almacenamiento", "Sala de ventas · La Sabana", "42900.00", 5, ["DEMO-CR-003"]),
    ("ENE-UPS-007", "UPS APC Back-UPS 900 VA", "Respaldo eléctrico para router, switch y estación de trabajo.", "Energía y respaldo", "Reserva técnica · Heredia", "73900.00", 3, ["DEMO-CR-004"]),
    ("PER-MOU-008", "Mouse Logitech M185 inalámbrico", "Mouse compacto con receptor USB para estaciones de oficina.", "Periféricos de trabajo", "Sala de ventas · La Sabana", "8900.00", 10, ["DEMO-CR-003"]),
]

# Días atrás, código, tipo, cantidad, proveedor (solo entradas), actor de muestra, observación.
MOVIMIENTOS = [
    (28, "RED-RTR-001", "ENTRADA", 12, "DEMO-CR-001", "vrojas", "Recepción de routers para despliegue de sucursales."),
    (27, "RED-SWT-002", "ENTRADA", 18, "DEMO-CR-001", "dsalazar", "Ingreso de switches para puestos administrativos."),
    (26, "RED-AP-003", "ENTRADA", 8, "DEMO-CR-001", "dsalazar", "Entrega de equipos Wi-Fi para instalaciones pendientes."),
    (25, "CAB-UTP-004", "ENTRADA", 10, "DEMO-CR-002", "vrojas", "Rollo de cable recibido para obras de noviembre."),
    (24, "CAB-RJ45-005", "ENTRADA", 24, "DEMO-CR-002", "dsalazar", "Abastecimiento de conectores para cuadrilla técnica."),
    (23, "ALM-SSD-006", "ENTRADA", 14, "DEMO-CR-003", "vrojas", "Reposición de SSD para actualización de portátiles."),
    (22, "ENE-UPS-007", "ENTRADA", 7, "DEMO-CR-004", "dsalazar", "Recepción de UPS para protección de red."),
    (21, "PER-MOU-008", "ENTRADA", 30, "DEMO-CR-003", "dsalazar", "Ingreso de periféricos para sala de ventas."),
    (18, "RED-RTR-001", "SALIDA", 5, None, "dsalazar", "Instalación de routers en dos oficinas de San José."),
    (17, "RED-SWT-002", "SALIDA", 9, None, "dsalazar", "Entrega de switches para renovación de puestos."),
    (16, "RED-AP-003", "SALIDA", 5, None, "vrojas", "Instalación de cobertura Wi-Fi en sede de Heredia."),
    (15, "CAB-UTP-004", "SALIDA", 6, None, "dsalazar", "Tendido de red en ampliación de oficinas."),
    (14, "CAB-RJ45-005", "SALIDA", 12, None, "dsalazar", "Material utilizado en ponchado de enlaces nuevos."),
    (13, "ALM-SSD-006", "SALIDA", 7, None, "vrojas", "Actualización de equipos de atención al cliente."),
    (12, "ENE-UPS-007", "SALIDA", 5, None, "dsalazar", "Protección de racks en dos sedes."),
    (11, "PER-MOU-008", "SALIDA", 17, None, "dsalazar", "Entrega de accesorios para estaciones nuevas."),
    (8, "RED-RTR-001", "ENTRADA", 4, "DEMO-CR-001", "vrojas", "Reposición parcial del lote de routers."),
    (7, "RED-SWT-002", "SALIDA", 4, None, "dsalazar", "Reserva para instalación programada en Escazú."),
    (6, "CAB-RJ45-005", "SALIDA", 6, None, "dsalazar", "Consumo de conectores en visita de soporte."),
    (5, "ALM-SSD-006", "SALIDA", 3, None, "vrojas", "Sustitución de discos en equipos de oficina."),
    (4, "PER-MOU-008", "ENTRADA", 10, "DEMO-CR-003", "dsalazar", "Reposición de mouse para mostrador."),
    (3, "ENE-UPS-007", "ENTRADA", 2, "DEMO-CR-004", "vrojas", "Reposición de UPS tras instalación técnica."),
]


class Command(BaseCommand):
    help = "Crea datos de ejemplo de una tienda de redes y cómputo en Costa Rica. Es idempotente."

    @transaction.atomic
    def handle(self, *args, **options):
        categorias = {
            nombre: Categoria.objects.get_or_create(nombre=nombre, defaults={"descripcion": descripcion})[0]
            for nombre, descripcion in CATEGORIAS
        }
        ubicaciones = {
            nombre: Ubicacion.objects.get_or_create(nombre=nombre, defaults={"descripcion": descripcion})[0]
            for nombre, descripcion in UBICACIONES
        }
        proveedores = {
            identificacion: Proveedor.objects.get_or_create(
                identificacion=identificacion,
                defaults={"nombre": nombre, "telefono": telefono, "correo": correo, "direccion": direccion},
            )[0]
            for nombre, identificacion, telefono, correo, direccion in PROVEEDORES
        }
        administrador = get_user_model().objects.get(username='Davox')

        productos = {}
        for codigo, nombre, descripcion, categoria, ubicacion, precio, minimo, ids_proveedores in PRODUCTOS:
            producto, creado = Producto.objects.get_or_create(
                codigo=codigo,
                defaults={
                    "nombre": nombre, "descripcion": descripcion, "categoria": categorias[categoria],
                    "ubicacion": ubicaciones[ubicacion], "precio": Decimal(precio),
                    "stock_minimo": minimo, "stock_actual": 0,
                },
            )
            if creado:
                producto.proveedores.add(*(proveedores[identificacion] for identificacion in ids_proveedores))
            productos[codigo] = producto

        creados = 0
        for dias, codigo, tipo, cantidad, identificacion, _actor_demo, observacion in MOVIMIENTOS:
            marca = f"[DEMO] {observacion}"
            if MovimientoInventario.objects.filter(observacion__startswith=marca).exists():
                continue
            datos = {
                "producto": productos[codigo].pk, "tipo": tipo, "cantidad": cantidad,
                "observacion": marca,
            }
            if identificacion:
                datos["proveedor"] = proveedores[identificacion].pk
            serializador = MovimientoInventarioSerializer(
                data=datos, context={"request": SimpleNamespace(user=administrador)}
            )
            serializador.is_valid(raise_exception=True)
            movimiento = serializador.save()
            MovimientoInventario.objects.filter(pk=movimiento.pk).update(fecha=timezone.now() - timedelta(days=dias))
            creados += 1

        self.stdout.write(self.style.SUCCESS(
            f"Datos listos: {len(categorias)} categorías, {len(ubicaciones)} ubicaciones, "
            f"{len(proveedores)} proveedores, {len(productos)} productos, "
            f"{creados} movimientos nuevos."
        ))
