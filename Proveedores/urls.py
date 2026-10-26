from django.urls import path

from . import views

urlpatterns = [
    path('', views.proveedores_api, name='proveedores_api'),
    path('<int:id>/', views.proveedor_detalle_api, name='proveedor_detalle_api'),
]
