from django.urls import path

from . import views

urlpatterns = [
    path('', views.productos_api, name='productos_api'),
    path('<int:id>/', views.producto_detalle_api, name='producto_detalle_api'),
]
