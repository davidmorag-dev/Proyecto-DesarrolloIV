from django.contrib.auth.models import Group, User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Ubicacion


class UbicacionesApiTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='admin', password='12345678')
        administrador, _ = Group.objects.get_or_create(name='Administrador')
        self.usuario.groups.add(administrador)
        self.client.force_authenticate(user=self.usuario)

    def test_actualiza_una_ubicacion(self):
        ubicacion = Ubicacion.objects.create(nombre='Bodega')
        respuesta = self.client.patch(
            f'/api/ubicaciones/{ubicacion.id}/', {'descripcion': 'Bodega principal'}, format='json',
        )
        ubicacion.refresh_from_db()

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(ubicacion.descripcion, 'Bodega principal')
