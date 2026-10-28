from django.core.paginator import Paginator
from django.db.models import Q
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Producto
from .serializers import ProductoSerializer


def tiene_permiso(request, accion):
    grupos = set(request.user.groups.values_list('name', flat=True))
    if request.user.is_superuser or 'Administrador' in grupos:
        return True
    return accion != 'eliminar' and 'Operador' in grupos


def respuesta_paginada(productos, pagina):
    paginador = Paginator(productos, 5)
    page = paginador.get_page(pagina)
    return Response({
        'pagina_actual': page.number,
        'total_paginas': paginador.num_pages,
        'total_registros': paginador.count,
        'resultados': ProductoSerializer(page.object_list, many=True).data,
    })


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def productos_api(request):
    if request.method == 'GET':
        productos = Producto.objects.select_related('categoria', 'ubicacion').prefetch_related('proveedores')
        categoria = request.query_params.get('categoria')
        ubicacion = request.query_params.get('ubicacion')
        proveedor = request.query_params.get('proveedor')
        buscar = request.query_params.get('buscar')
        activo = request.query_params.get('activo')
        ordenar = request.query_params.get('ordenar', 'nombre')

        if categoria:
            productos = productos.filter(categoria__nombre__icontains=categoria)
        if ubicacion:
            productos = productos.filter(ubicacion__nombre__icontains=ubicacion)
        if proveedor:
            productos = productos.filter(proveedores__nombre__icontains=proveedor)
        if buscar:
            productos = productos.filter(Q(nombre__icontains=buscar) | Q(codigo__icontains=buscar))
        if activo is not None:
            if activo.lower() not in ['true', 'false']:
                return Response({'activo': 'Utilice true o false.'}, status=status.HTTP_400_BAD_REQUEST)
            productos = productos.filter(activo=activo.lower() == 'true')
        if ordenar.lstrip('-') not in ['nombre', 'codigo', 'precio', 'stock_actual']:
            return Response({'ordenar': 'Campo de ordenamiento no permitido.'}, status=status.HTTP_400_BAD_REQUEST)
        return respuesta_paginada(productos.distinct().order_by(ordenar), request.query_params.get('page', 1))

    if not tiene_permiso(request, 'crear'):
        return Response({'detail': 'No tiene permiso para crear productos.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = ProductoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def producto_detalle_api(request, id):
    try:
        producto = Producto.objects.select_related('categoria', 'ubicacion').prefetch_related('proveedores').get(id=id)
    except Producto.DoesNotExist:
        return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ProductoSerializer(producto).data)
    if request.method in ['PUT', 'PATCH']:
        if not tiene_permiso(request, 'editar'):
            return Response({'detail': 'No tiene permiso para editar productos.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductoSerializer(producto, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if not tiene_permiso(request, 'eliminar'):
        return Response({'detail': 'No tiene permiso para eliminar productos.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        producto.delete()
    except ProtectedError:
        return Response({'detail': 'El producto posee movimientos registrados.'}, status=status.HTTP_409_CONFLICT)
    return Response(status=status.HTTP_204_NO_CONTENT)
