from django.contrib.auth.models import Group, User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Proveedor


class ProveedoresApiTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='admin', password='12345678')
        administrador, _ = Group.objects.get_or_create(name='Administrador')
        self.usuario.groups.add(administrador)
        self.client.force_authenticate(user=self.usuario)

    def test_crea_y_lista_proveedores(self):
        respuesta = self.client.post('/api/proveedores/', {
            'nombre': 'Proveedor Uno', 'identificacion': '3101001001',
            'telefono': '22222222', 'correo': 'proveedor@correo.com',
        }, format='json')
        listado = self.client.get('/api/proveedores/')

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(listado.status_code, status.HTTP_200_OK)
        self.assertEqual(Proveedor.objects.count(), 1)
