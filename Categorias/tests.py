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

    def test_administrador_no_elimina_categoria_con_productos(self):
        from Productos.models import Producto
        from Ubicaciones.models import Ubicacion

        categoria = Categoria.objects.create(nombre='Herramientas')
        ubicacion = Ubicacion.objects.create(nombre='Bodega de prueba')
        Producto.objects.create(
            codigo='AUD-TAL-001', nombre='Taladro de prueba',
            categoria=categoria, ubicacion=ubicacion, precio=15000,
        )

        respuesta = self.client.delete(f'/api/categorias/{categoria.id}/')

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(Categoria.objects.filter(id=categoria.id).exists())


class PermisosCategoriasApiTest(APITestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre='Papelería')

    def autenticar(self, grupo):
        usuario = User.objects.create(username=f'auditoria_{grupo.lower()}')
        usuario.groups.add(Group.objects.get_or_create(name=grupo)[0])
        self.client.force_authenticate(user=usuario)

    def test_operador_puede_crear_y_editar_pero_no_eliminar(self):
        self.autenticar('Operador')
        crear = self.client.post('/api/categorias/', {'nombre': 'Limpieza'}, format='json')
        editar = self.client.patch(
            f'/api/categorias/{self.categoria.id}/',
            {'descripcion': 'Artículos de oficina'}, format='json',
        )
        eliminar = self.client.delete(f'/api/categorias/{self.categoria.id}/')

        self.assertEqual(crear.status_code, status.HTTP_201_CREATED)
        self.assertEqual(editar.status_code, status.HTTP_200_OK)
        self.assertEqual(eliminar.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Categoria.objects.filter(id=self.categoria.id).exists())

    def test_consulta_solo_puede_leer(self):
        self.autenticar('Consulta')
        leer = self.client.get(f'/api/categorias/{self.categoria.id}/')
        crear = self.client.post('/api/categorias/', {'nombre': 'Limpieza'}, format='json')
        editar = self.client.patch(
            f'/api/categorias/{self.categoria.id}/', {'descripcion': 'No permitido'}, format='json',
        )
        eliminar = self.client.delete(f'/api/categorias/{self.categoria.id}/')

        self.assertEqual(leer.status_code, status.HTTP_200_OK)
        for respuesta in (crear, editar, eliminar):
            self.assertEqual(respuesta.status_code, status.HTTP_403_FORBIDDEN)
        self.categoria.refresh_from_db()
        self.assertEqual(self.categoria.descripcion, '')

    def test_sin_token_devuelve_401(self):
        respuesta = self.client.get('/api/categorias/')

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)
