from django.db import models


class MovimientoInventario(models.Model):
    ENTRADA = 'ENTRADA'
    SALIDA = 'SALIDA'
    TIPOS_MOVIMIENTO = [
        (ENTRADA, 'Entrada'),
        (SALIDA, 'Salida'),
    ]

    producto = models.ForeignKey('Productos.Producto', on_delete=models.PROTECT)
    tipo = models.CharField(max_length=10, choices=TIPOS_MOVIMIENTO)
    cantidad = models.PositiveIntegerField()
    proveedor = models.ForeignKey(
        'Proveedores.Proveedor', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    stock_anterior = models.PositiveIntegerField()
    stock_resultante = models.PositiveIntegerField()
    usuario = models.ForeignKey('auth.User', on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True)

    def __str__(self):
        return f'{self.tipo} - {self.producto.nombre}'
