from django.core.paginator import Paginator
from django.db.models import F
from rest_framework import serializers, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from Productos.models import Producto
from .models import MovimientoInventario
from .serializers import MovimientoInventarioSerializer


def puede_registrar(request):
    grupos = set(request.user.groups.values_list('name', flat=True))
    return request.user.is_superuser or 'Administrador' in grupos or 'Operador' in grupos


def respuesta_paginada(movimientos, pagina):
    paginador = Paginator(movimientos, 5)
    page = paginador.get_page(pagina)
    return Response({
        'pagina_actual': page.number,
        'total_paginas': paginador.num_pages,
        'total_registros': paginador.count,
        'resultados': MovimientoInventarioSerializer(page.object_list, many=True).data,
    })


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def movimientos_api(request):
    if request.method == 'GET':
        movimientos = MovimientoInventario.objects.select_related('producto', 'proveedor', 'usuario').order_by('-fecha')
        producto = request.query_params.get('producto')
        usuario = request.query_params.get('usuario')
        tipo = request.query_params.get('tipo')
        if producto:
            movimientos = movimientos.filter(producto__codigo__icontains=producto)
        if usuario:
            movimientos = movimientos.filter(usuario__username__icontains=usuario)
        if tipo:
            movimientos = movimientos.filter(tipo=tipo.upper())
        return respuesta_paginada(movimientos, request.query_params.get('page', 1))

    if not puede_registrar(request):
        return Response({'detail': 'No tiene permiso para registrar movimientos.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = MovimientoInventarioSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        try:
            serializer.save()
        except serializers.ValidationError as error:
            return Response(error.detail, status=status.HTTP_409_CONFLICT)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def movimiento_detalle_api(request, id):
    try:
        movimiento = MovimientoInventario.objects.select_related('producto', 'proveedor', 'usuario').get(id=id)
    except MovimientoInventario.DoesNotExist:
        return Response({'error': 'Movimiento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(MovimientoInventarioSerializer(movimiento).data)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def stock_bajo_api(request):
    productos = Producto.objects.select_related('categoria', 'ubicacion').filter(stock_actual__lte=F('stock_minimo')).order_by('nombre')
    return Response({
        'total_registros': productos.count(),
        'resultados': [{
            'id': producto.id,
            'codigo': producto.codigo,
            'nombre': producto.nombre,
            'stock_actual': producto.stock_actual,
            'stock_minimo': producto.stock_minimo,
        } for producto in productos],
    })
