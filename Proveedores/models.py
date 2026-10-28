from django.db import models


class Proveedor(models.Model):
    nombre = models.CharField(max_length=150)
    identificacion = models.CharField(max_length=50, unique=True)
    telefono = models.CharField(max_length=30)
    correo = models.EmailField()
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
