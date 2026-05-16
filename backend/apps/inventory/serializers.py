from rest_framework import serializers

from .models import Batch, Category, ConsumptionLog, ProductTemplate


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTemplate
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product_template.name", read_only=True)
    storage_name = serializers.CharField(source="storage.name", read_only=True)
    unit = serializers.CharField(source="product_template.unit", read_only=True)

    class Meta:
        model = Batch
        fields = "__all__"
        read_only_fields = ("Q_current", "last_calculated_at", "status")

    def validate(self, attrs):
        storage = attrs.get("storage")
        restaurant = attrs.get("restaurant")
        if storage and restaurant and storage.restaurant_id != restaurant.id:
            raise serializers.ValidationError("Storage does not belong to this restaurant.")
        if "quantity_current" not in attrs and "quantity_initial" in attrs:
            attrs["quantity_current"] = attrs["quantity_initial"]
        return attrs


class ConsumeSerializer(serializers.Serializer):
    quantity = serializers.FloatField(min_value=0.0001)
    purpose = serializers.ChoiceField(choices=ConsumptionLog.Purpose.choices, default="cooking")
    note = serializers.CharField(required=False, allow_blank=True)
