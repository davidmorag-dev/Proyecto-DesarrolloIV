from django.contrib.auth.models import Group, User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Categoria


class CategoriasApiTest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='admin', password='12345678')
        administrador, _ = Group.objects.get_or_create(name='Administrador')
        self.usuario.groups.add(administrador)
        self.client.force_authenticate(user=self.usuario)

    def test_crud_de_categoria(self):
        crear = self.client.post('/api/categorias/', {
            'nombre': 'Abarrotes', 'descripcion': 'Productos básicos',
        }, format='json')
        categoria_id = crear.data['id']
        editar = self.client.patch(
            f'/api/categorias/{categoria_id}/', {'descripcion': 'Alimentos'}, format='json',
        )
        eliminar = self.client.delete(f'/api/categorias/{categoria_id}/')

        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        self.assertEqual(editar.status_code, status.HTTP_200_OK)
        self.assertEqual(eliminar.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Categoria.objects.filter(id=categoria_id).exists())
