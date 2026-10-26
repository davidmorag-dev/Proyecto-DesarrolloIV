from django.db import transaction
from rest_framework import serializers

from Productos.models import Producto
from .models import MovimientoInventario


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = '__all__'
        read_only_fields = ('stock_anterior', 'stock_resultante', 'usuario', 'fecha')

    def validate(self, data):
        protegidos = {'stock_anterior', 'stock_resultante', 'usuario', 'fecha'}
        enviados = protegidos.intersection(self.initial_data.keys())
        if enviados:
            raise serializers.ValidationError({campo: 'Este campo lo controla el servidor.' for campo in enviados})

        producto = data['producto']
        tipo = data['tipo']
        proveedor = data.get('proveedor')
        if not producto.activo:
            raise serializers.ValidationError({'producto': 'No se pueden registrar movimientos en productos inactivos.'})
        if tipo == MovimientoInventario.ENTRADA:
            if proveedor is None:
                raise serializers.ValidationError({'proveedor': 'La entrada requiere un proveedor.'})
            if not proveedor.activo:
                raise serializers.ValidationError({'proveedor': 'El proveedor debe estar activo.'})
            if not producto.proveedores.filter(id=proveedor.id).exists():
                raise serializers.ValidationError({'proveedor': 'El proveedor no está asociado al producto.'})
        if tipo == MovimientoInventario.SALIDA and proveedor is not None:
            raise serializers.ValidationError({'proveedor': 'Las salidas no llevan proveedor.'})
        return data

    def create(self, validated_data):
        usuario = self.context['request'].user
        with transaction.atomic():
            producto = Producto.objects.select_for_update().get(id=validated_data['producto'].id)
            cantidad = validated_data['cantidad']
            if cantidad <= 0:
                raise serializers.ValidationError({'cantidad': 'La cantidad debe ser mayor que cero.'})
            anterior = producto.stock_actual
            if validated_data['tipo'] == MovimientoInventario.SALIDA and cantidad > anterior:
                raise serializers.ValidationError({'cantidad': 'La salida supera el stock disponible.'})
            resultante = anterior + cantidad if validated_data['tipo'] == MovimientoInventario.ENTRADA else anterior - cantidad
            producto.stock_actual = resultante
            producto.save(update_fields=['stock_actual'])
            return MovimientoInventario.objects.create(
                **validated_data,
                usuario=usuario,
                stock_anterior=anterior,
                stock_resultante=resultante,
            )
