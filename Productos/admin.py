from django.contrib import admin

from .models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'ubicacion', 'stock_actual', 'activo')
    search_fields = ('codigo', 'nombre')
    list_filter = ('activo', 'categoria', 'ubicacion')
    readonly_fields = ('stock_actual',)
