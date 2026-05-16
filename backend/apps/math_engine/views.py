from collections import defaultdict

from rest_framework.response import Response
from rest_framework.views import APIView

from apps.inventory.models import Batch

from .freshness import KineticParams, fifo_optimization, waste_forecast_monte_carlo


class FIFORecommendationView(APIView):
    """Greedy FIFO plan: ascending Q within each product template."""

    def get(self, request):
        restaurant_id = request.query_params.get("restaurant")
        batches = Batch.objects.filter(
            restaurant__owner=request.user, status=Batch.Status.ACTIVE
        ).select_related("product_template", "storage")
        if restaurant_id:
            batches = batches.filter(restaurant_id=restaurant_id)

        demand: dict[int, float] = {}
        for b in batches:
            demand[b.product_template_id] = demand.get(b.product_template_id, 0) + b.quantity_current

        plan = fifo_optimization(list(batches), demand)

        by_id = {b.id: b for b in batches}
        items = []
        for entry in plan:
            b = by_id[entry["batch_id"]]
            items.append({
                "batch_id": b.id,
                "product_name": b.product_template.name,
                "storage_name": b.storage.name,
                "unit": b.product_template.unit,
                "quantity": entry["quantity"],
                "Q": round(entry["Q"], 3),
                "Q_critical": b.product_template.Q_critical,
                "unit_price": float(b.unit_price),
                "received_at": b.received_at,
            })
        return Response({
            "count": len(items),
            "items": items,
        })


class WasteForecastView(APIView):
    """Monte-Carlo waste forecast: per-batch and aggregate."""

    def get(self, request):
        hours_ahead = int(request.query_params.get("hours", 168))
        runs = int(request.query_params.get("runs", 5000))
        temp_sigma = float(request.query_params.get("sigma", 1.5))

        batches = Batch.objects.filter(
            restaurant__owner=request.user, status=Batch.Status.ACTIVE
        ).select_related("product_template", "storage")

        per_batch = []
        expected_loss_uzs = 0.0
        for b in batches:
            tpl = b.product_template
            params = KineticParams(
                E_a_kj=tpl.E_a, A=tpl.A_coefficient, Q_critical=tpl.Q_critical
            )
            mid = (tpl.T_optimal_min + tpl.T_optimal_max) / 2
            expected_temp = b.storage.current_temp if b.storage.current_temp is not None else mid
            result = waste_forecast_monte_carlo(
                q_current=b.Q_current,
                expected_temp_c=expected_temp,
                temp_sigma=temp_sigma,
                params=params,
                hours_ahead=hours_ahead,
                runs=runs,
            )
            value_at_risk = float(b.quantity_current) * float(b.unit_price)
            loss = result["waste_probability"] * value_at_risk
            expected_loss_uzs += loss
            per_batch.append({
                "batch_id": b.id,
                "product_name": tpl.name,
                "Q_current": b.Q_current,
                "waste_probability": round(result["waste_probability"], 3),
                "mean_q": round(result["mean_q"], 3),
                "p05_q": round(result["p05_q"], 3),
                "p95_q": round(result["p95_q"], 3),
                "value_at_risk": value_at_risk,
                "expected_loss": round(loss, 2),
            })

        per_batch.sort(key=lambda x: -x["waste_probability"])

        return Response({
            "horizon_hours": hours_ahead,
            "horizon_days": round(hours_ahead / 24, 1),
            "runs_per_batch": runs,
            "temperature_sigma": temp_sigma,
            "expected_loss_uzs": round(expected_loss_uzs, 2),
            "items": per_batch,
        })
