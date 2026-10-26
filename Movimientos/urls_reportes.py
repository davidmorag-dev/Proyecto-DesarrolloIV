from django.urls import path

from . import views

urlpatterns = [
    path('', views.stock_bajo_api, name='stock_bajo_api'),
]
