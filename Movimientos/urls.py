from django.urls import path

from . import views

urlpatterns = [
    path('', views.movimientos_api, name='movimientos_api'),
    path('<int:id>/', views.movimiento_detalle_api, name='movimiento_detalle_api'),
]
