from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def healthz(_request):
    return JsonResponse({"status": "ok"})

api_v1 = [
    path("auth/", include("apps.users.urls")),
    path("", include("apps.restaurants.urls")),
    path("", include("apps.inventory.urls")),
    path("", include("apps.sensors.urls")),
    path("", include("apps.alerts.urls")),
    path("", include("apps.reports.urls")),
]

urlpatterns = [
    path("healthz/", healthz, name="healthz"),
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema")),
]
