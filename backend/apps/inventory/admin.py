from django.contrib import admin

from .models import Batch, Category, ConsumptionLog, ProductTemplate

admin.site.register(Category)
admin.site.register(ProductTemplate)
admin.site.register(Batch)
admin.site.register(ConsumptionLog)
