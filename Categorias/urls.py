from django.urls import path

from . import views

urlpatterns = [
    path('', views.categorias_api, name='categorias_api'),
    path('<int:id>/', views.categoria_detalle_api, name='categoria_detalle_api'),
]
