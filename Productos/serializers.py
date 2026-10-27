from rest_framework import serializers

from .models import Producto


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ubicacion_nombre = serializers.CharField(source='ubicacion.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ('stock_actual',)

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError('El precio debe ser mayor que cero.')
        return value

    def validate_categoria(self, value):
        if not value.activo:
            raise serializers.ValidationError('No se puede asignar una categoría inactiva.')
        return value

    def validate_ubicacion(self, value):
        if not value.activo:
            raise serializers.ValidationError('No se puede asignar una ubicación inactiva.')
        return value
