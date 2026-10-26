from django.db import models


class Producto(models.Model):
    codigo = models.CharField(max_length=30, unique=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    categoria = models.ForeignKey('Categorias.Categoria', on_delete=models.PROTECT)
    ubicacion = models.ForeignKey('Ubicaciones.Ubicacion', on_delete=models.PROTECT)
    proveedores = models.ManyToManyField('Proveedores.Proveedor', blank=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    stock_minimo = models.PositiveIntegerField(default=0)
    stock_actual = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
