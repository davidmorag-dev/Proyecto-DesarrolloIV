from django.contrib.auth.models import Group, User
from rest_framework import status
from rest_framework.test import APITestCase

from Categorias.models import Categoria
from Proveedores.models import Proveedor
from Ubicaciones.models import Ubicacion
from .models import Producto


class ProductosApiTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='admin', password='12345678')
        administrador, _ = Group.objects.get_or_create(name='Administrador')
        self.usuario.groups.add(administrador)
        self.client.force_authenticate(user=self.usuario)
        self.categoria = Categoria.objects.create(nombre='Abarrotes')
        self.ubicacion = Ubicacion.objects.create(nombre='Bodega')
        self.proveedor = Proveedor.objects.create(
            nombre='Proveedor Uno', identificacion='3101001001',
            telefono='22222222', correo='proveedor@correo.com',
        )

    def test_filtra_y_pagina_productos(self):
        for indice in range(6):
            producto = Producto.objects.create(
                codigo=f'AB-{indice}', nombre=f'Arroz {indice}', categoria=self.categoria,
                ubicacion=self.ubicacion, precio=1000,
            )
            producto.proveedores.add(self.proveedor)

        respuesta = self.client.get('/api/productos/?categoria=Abarrotes&buscar=Arroz')

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data['total_registros'], 6)
        self.assertEqual(len(respuesta.data['resultados']), 5)

    def test_patch_rechaza_precio_no_positivo(self):
        producto = Producto.objects.create(
            codigo='AUD-RES-001', nombre='Resma de papel',
            categoria=self.categoria, ubicacion=self.ubicacion, precio=2500,
        )

        respuesta = self.client.patch(
            f'/api/productos/{producto.id}/', {'precio': '0.00'}, format='json',
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        producto.refresh_from_db()
        self.assertEqual(producto.precio, 2500)

    def test_patch_rechaza_categoria_y_ubicacion_inactivas(self):
        producto = Producto.objects.create(
            codigo='AUD-TEC-001', nombre='Teclado de prueba',
            categoria=self.categoria, ubicacion=self.ubicacion, precio=8900,
        )
        categoria_inactiva = Categoria.objects.create(nombre='Archivada', activo=False)
        ubicacion_inactiva = Ubicacion.objects.create(nombre='Almacén cerrado', activo=False)

        categoria = self.client.patch(
            f'/api/productos/{producto.id}/',
            {'categoria': categoria_inactiva.id}, format='json',
        )
        ubicacion = self.client.patch(
            f'/api/productos/{producto.id}/',
            {'ubicacion': ubicacion_inactiva.id}, format='json',
        )

        self.assertEqual(categoria.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ubicacion.status_code, status.HTTP_400_BAD_REQUEST)
        producto.refresh_from_db()
        self.assertEqual(producto.categoria_id, self.categoria.id)
        self.assertEqual(producto.ubicacion_id, self.ubicacion.id)
