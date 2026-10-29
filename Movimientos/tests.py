from django.contrib.auth.models import Group, User
from rest_framework import status
from rest_framework.test import APITestCase

from Categorias.models import Categoria
from Productos.models import Producto
from Proveedores.models import Proveedor
from Ubicaciones.models import Ubicacion
from .models import MovimientoInventario


class MovimientosApiTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='operador', password='12345678')
        operador, _ = Group.objects.get_or_create(name='Operador')
        self.usuario.groups.add(operador)
        self.client.force_authenticate(user=self.usuario)

        categoria = Categoria.objects.create(nombre='Abarrotes')
        ubicacion = Ubicacion.objects.create(nombre='Bodega principal')
        self.proveedor = Proveedor.objects.create(
            nombre='Proveedor Uno', identificacion='3101001001',
            telefono='22222222', correo='proveedor@correo.com',
        )
        self.producto = Producto.objects.create(
            codigo='AR-001', nombre='Arroz', categoria=categoria,
            ubicacion=ubicacion, precio=1500, stock_minimo=4,
        )
        self.producto.proveedores.add(self.proveedor)

    def entrada(self, cantidad=10):
        return self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': MovimientoInventario.ENTRADA,
            'cantidad': cantidad,
            'proveedor': self.proveedor.id,
        }, format='json')

    def test_entrada_actualiza_el_stock(self):
        respuesta = self.entrada()
        self.producto.refresh_from_db()

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.producto.stock_actual, 10)
        self.assertEqual(respuesta.data['stock_anterior'], 0)
        self.assertEqual(respuesta.data['stock_resultante'], 10)

    def test_salida_no_puede_superar_el_stock(self):
        self.entrada(5)
        respuesta = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': MovimientoInventario.SALIDA,
            'cantidad': 6,
        }, format='json')

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(MovimientoInventario.objects.count(), 1)

    def test_salida_no_acepta_proveedor(self):
        respuesta = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': MovimientoInventario.SALIDA,
            'cantidad': 1,
            'proveedor': self.proveedor.id,
        }, format='json')

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('proveedor', respuesta.data)

    def test_campos_de_stock_no_se_pueden_manipular(self):
        respuesta = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': MovimientoInventario.ENTRADA,
            'cantidad': 2,
            'proveedor': self.proveedor.id,
            'stock_resultante': 900,
        }, format='json')

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock_resultante', respuesta.data)

    def test_reporte_muestra_producto_con_stock_bajo(self):
        respuesta = self.client.get('/api/reportes/stock-bajo/')

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data['total_registros'], 1)
