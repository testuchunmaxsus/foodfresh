from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BatchViewSet,
    CategoryViewSet,
    DashboardSummaryView,
    ProductTemplateViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("product-templates", ProductTemplateViewSet, basename="product-template")
router.register("batches", BatchViewSet, basename="batch")

urlpatterns = router.urls + [
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]
