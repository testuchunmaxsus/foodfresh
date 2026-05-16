from rest_framework.routers import DefaultRouter

from .views import RestaurantViewSet, StorageViewSet

router = DefaultRouter()
router.register("restaurants", RestaurantViewSet, basename="restaurant")
router.register("storages", StorageViewSet, basename="storage")

urlpatterns = router.urls
