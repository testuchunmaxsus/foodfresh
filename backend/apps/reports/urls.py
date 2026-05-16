from rest_framework.routers import DefaultRouter

from .views import MonthlyReportViewSet

router = DefaultRouter()
router.register("reports/monthly", MonthlyReportViewSet, basename="monthly-report")

urlpatterns = router.urls
