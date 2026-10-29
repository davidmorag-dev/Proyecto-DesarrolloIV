from django.contrib import admin

from .models import MovimientoInventario


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('producto', 'tipo', 'cantidad', 'stock_anterior', 'stock_resultante', 'usuario', 'fecha')
    readonly_fields = ('producto', 'tipo', 'cantidad', 'proveedor', 'stock_anterior', 'stock_resultante', 'usuario', 'fecha', 'observacion')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
