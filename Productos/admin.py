from django.contrib import admin

from .models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'ubicacion', 'precio', 'stock_actual', 'stock_minimo', 'requiere_reposicion', 'activo')
    search_fields = ('codigo', 'nombre')
    list_filter = ('activo', 'categoria', 'ubicacion')
    readonly_fields = ('stock_actual',)
    list_select_related = ('categoria', 'ubicacion')

    @admin.display(boolean=True, description='Reponer')
    def requiere_reposicion(self, obj):
        return obj.stock_actual <= obj.stock_minimo
