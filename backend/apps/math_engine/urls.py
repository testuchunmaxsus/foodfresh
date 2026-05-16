from django.urls import path

from .views import FIFORecommendationView, WasteForecastView

urlpatterns = [
    path("recommendations/fifo/", FIFORecommendationView.as_view(), name="fifo"),
    path("forecast/weekly/", WasteForecastView.as_view(), name="forecast"),
]
