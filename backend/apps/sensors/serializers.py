from rest_framework import serializers

from .models import TemperatureReading


class TemperatureReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemperatureReading
        fields = "__all__"
        read_only_fields = ("recorded_at",)


class IngestSerializer(serializers.Serializer):
    sensor_id = serializers.CharField()
    temperature = serializers.FloatField()
