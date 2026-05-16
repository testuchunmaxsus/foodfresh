from rest_framework import serializers

from .models import Restaurant, Storage


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = "__all__"
        read_only_fields = ("owner", "created_at")


class StorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Storage
        fields = "__all__"
