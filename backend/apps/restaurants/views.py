from rest_framework import viewsets

from .models import Restaurant, Storage
from .serializers import RestaurantSerializer, StorageSerializer


class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer

    def get_queryset(self):
        return Restaurant.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StorageViewSet(viewsets.ModelViewSet):
    serializer_class = StorageSerializer
    filterset_fields = ["restaurant", "type"]

    def get_queryset(self):
        return Storage.objects.filter(restaurant__owner=self.request.user)
