from rest_framework import viewsets

from .models import MonthlyReport
from .serializers import MonthlyReportSerializer


class MonthlyReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MonthlyReportSerializer
    filterset_fields = ["restaurant"]

    def get_queryset(self):
        return MonthlyReport.objects.filter(restaurant__owner=self.request.user)
