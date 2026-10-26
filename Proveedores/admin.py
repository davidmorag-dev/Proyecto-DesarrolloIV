from django.contrib import admin

from .models import Proveedor


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'identificacion', 'correo', 'activo')
    search_fields = ('nombre', 'identificacion')
    list_filter = ('activo',)
