from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Categoria
from .serializers import CategoriaSerializer


def tiene_permiso(request, accion):
    grupos = set(request.user.groups.values_list('name', flat=True))
    if request.user.is_superuser or 'Administrador' in grupos:
        return True
    return accion != 'eliminar' and 'Operador' in grupos


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def categorias_api(request):
    if request.method == 'GET':
        categorias = Categoria.objects.order_by('nombre')
        return Response(CategoriaSerializer(categorias, many=True).data)

    if not tiene_permiso(request, 'crear'):
        return Response({'detail': 'No tiene permiso para crear categorías.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = CategoriaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def categoria_detalle_api(request, id):
    try:
        categoria = Categoria.objects.get(id=id)
    except Categoria.DoesNotExist:
        return Response({'error': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(CategoriaSerializer(categoria).data)
    if request.method in ['PUT', 'PATCH']:
        if not tiene_permiso(request, 'editar'):
            return Response({'detail': 'No tiene permiso para editar categorías.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategoriaSerializer(categoria, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if not tiene_permiso(request, 'eliminar'):
        return Response({'detail': 'No tiene permiso para eliminar categorías.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        categoria.delete()
    except ProtectedError:
        return Response({'detail': 'La categoría está relacionada con productos.'}, status=status.HTTP_409_CONFLICT)
    return Response(status=status.HTTP_204_NO_CONTENT)
