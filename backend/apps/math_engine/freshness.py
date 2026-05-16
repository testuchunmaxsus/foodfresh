"""Food quality kinetics engine.

Models product quality decay using first-order kinetics with an
Arrhenius temperature dependence:

    dQ/dt = -k(T) * Q
    k(T)  = A * exp(-Ea / (R * T))

Q is normalized to [0, 1]; t is in hours; T is in Kelvin; Ea is in J/mol.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable

import numpy as np

R = 8.314


@dataclass(frozen=True)
class KineticParams:
    E_a_kj: float
    A: float
    Q_critical: float = 0.6


def arrhenius_rate(temperature_c: float, params: KineticParams) -> float:
    T = temperature_c + 273.15
    if T <= 0:
        return 0.0
    return params.A * math.exp(-(params.E_a_kj * 1000.0) / (R * T))


def quality_after(
    q0: float,
    elapsed_hours: float,
    temperature_c: float,
    params: KineticParams,
) -> float:
    k = arrhenius_rate(temperature_c, params)
    return max(0.0, q0 * math.exp(-k * elapsed_hours))


def quality_integral(
    q0: float,
    readings: Iterable[tuple[datetime, float]],
    now: datetime,
    params: KineticParams,
) -> float:
    """Compute Q(now) using trapezoidal integration over real temperature history.

    `readings` is an iterable of (timestamp, temperature_°C) ordered ascending.
    """
    pts = list(readings)
    if not pts:
        return q0
    times = [p[0] for p in pts] + [now]
    rates = [arrhenius_rate(p[1], params) for p in pts]
    rates.append(rates[-1])
    integral = 0.0
    for i in range(1, len(times)):
        dt_h = (times[i] - times[i - 1]).total_seconds() / 3600.0
        integral += 0.5 * (rates[i - 1] + rates[i]) * dt_h
    return max(0.0, q0 * math.exp(-integral))


def time_to_critical(
    q_current: float,
    temperature_c: float,
    params: KineticParams,
) -> float:
    """Hours until Q reaches Q_critical at constant temperature."""
    if q_current <= params.Q_critical:
        return 0.0
    k = arrhenius_rate(temperature_c, params)
    if k <= 0:
        return float("inf")
    return math.log(q_current / params.Q_critical) / k


def calculate_quality(batch, now: datetime | None = None) -> float:
    """Compute Q(t) for an inventory.Batch using its readings history."""
    from apps.sensors.models import TemperatureReading

    now = now or datetime.now(tz=batch.received_at.tzinfo)
    tpl = batch.product_template
    params = KineticParams(E_a_kj=tpl.E_a, A=tpl.A_coefficient, Q_critical=tpl.Q_critical)
    readings_qs = TemperatureReading.objects.filter(
        storage=batch.storage, recorded_at__gte=batch.received_at
    ).order_by("recorded_at")
    readings = [(r.recorded_at, r.temperature) for r in readings_qs]
    if not readings:
        fallback_t = batch.storage.current_temp or (
            (tpl.T_optimal_min + tpl.T_optimal_max) / 2.0
        )
        elapsed_h = (now - batch.received_at).total_seconds() / 3600.0
        return quality_after(1.0, elapsed_h, fallback_t, params)
    return quality_integral(1.0, readings, now, params)


def quality_history(batch, step_hours: float = 6.0) -> list[dict]:
    """Return Q(t) sampled over the batch lifetime, for charting."""
    tpl = batch.product_template
    params = KineticParams(E_a_kj=tpl.E_a, A=tpl.A_coefficient, Q_critical=tpl.Q_critical)
    now = datetime.now(tz=batch.received_at.tzinfo)
    total = (now - batch.received_at).total_seconds() / 3600.0
    if total <= 0:
        return [{"t": batch.received_at.isoformat(), "q": 1.0}]
    points: list[dict] = []
    steps = max(2, int(total / step_hours))
    for i in range(steps + 1):
        h = total * i / steps
        ts = batch.received_at + timedelta(hours=h)
        t_c = batch.storage.current_temp or ((tpl.T_optimal_min + tpl.T_optimal_max) / 2.0)
        q = quality_after(1.0, h, t_c, params)
        points.append({"t": ts.isoformat(), "q": round(q, 4)})
    return points


def fifo_optimization(batches: list, daily_demand: dict[int, float]) -> list[dict]:
    """Recommend consumption order maximizing total quality value.

    `daily_demand` maps product_template_id → quantity needed.
    Greedy by ascending Q (lowest-quality first within a product template).
    """
    grouped: dict[int, list] = {}
    for b in batches:
        grouped.setdefault(b.product_template_id, []).append(b)
    plan: list[dict] = []
    for tpl_id, demand in daily_demand.items():
        items = sorted(grouped.get(tpl_id, []), key=lambda x: x.Q_current)
        remaining = demand
        for b in items:
            if remaining <= 0:
                break
            take = min(b.quantity_current, remaining)
            plan.append({
                "batch_id": b.id,
                "product_template_id": tpl_id,
                "quantity": take,
                "Q": b.Q_current,
            })
            remaining -= take
    return plan


def waste_forecast_monte_carlo(
    q_current: float,
    expected_temp_c: float,
    temp_sigma: float,
    params: KineticParams,
    hours_ahead: int = 168,
    runs: int = 10_000,
) -> dict:
    """Monte-Carlo simulation of waste probability over `hours_ahead`."""
    rng = np.random.default_rng()
    temps = rng.normal(expected_temp_c, temp_sigma, size=runs)
    k_values = np.array([arrhenius_rate(float(t), params) for t in temps])
    q_final = q_current * np.exp(-k_values * hours_ahead)
    waste_mask = q_final < params.Q_critical
    return {
        "mean_q": float(q_final.mean()),
        "p05_q": float(np.percentile(q_final, 5)),
        "p95_q": float(np.percentile(q_final, 95)),
        "waste_probability": float(waste_mask.mean()),
    }
