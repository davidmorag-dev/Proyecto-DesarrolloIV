from django.urls import path

from . import views

urlpatterns = [
    path('', views.ubicaciones_api, name='ubicaciones_api'),
    path('<int:id>/', views.ubicacion_detalle_api, name='ubicacion_detalle_api'),
]
