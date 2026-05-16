from datetime import datetime, timedelta, timezone

import pytest

from apps.math_engine.freshness import (
    KineticParams,
    arrhenius_rate,
    quality_after,
    quality_integral,
    time_to_critical,
    waste_forecast_monte_carlo,
)


PARAMS_BEEF = KineticParams(E_a_kj=75.0, A=1.2e11, Q_critical=0.6)


def test_arrhenius_rate_increases_with_temperature():
    k_low = arrhenius_rate(0.0, PARAMS_BEEF)
    k_high = arrhenius_rate(20.0, PARAMS_BEEF)
    assert k_high > k_low > 0


def test_quality_decays_monotonically():
    q1 = quality_after(1.0, 1.0, 4.0, PARAMS_BEEF)
    q2 = quality_after(1.0, 24.0, 4.0, PARAMS_BEEF)
    q3 = quality_after(1.0, 72.0, 4.0, PARAMS_BEEF)
    assert 1.0 > q1 > q2 > q3 >= 0


def test_q10_rule_approximately():
    # Q10 rule: rate roughly 2-3x per +10°C
    k_4 = arrhenius_rate(4.0, PARAMS_BEEF)
    k_14 = arrhenius_rate(14.0, PARAMS_BEEF)
    ratio = k_14 / k_4
    assert 2.0 <= ratio <= 4.0


def test_time_to_critical_zero_when_already_critical():
    assert time_to_critical(0.5, 4.0, PARAMS_BEEF) == 0.0


def test_quality_integral_matches_constant_temp():
    now = datetime(2026, 5, 16, tzinfo=timezone.utc)
    start = now - timedelta(hours=24)
    readings = [(start + timedelta(hours=h), 4.0) for h in range(0, 25, 6)]
    q_integral = quality_integral(1.0, readings, now, PARAMS_BEEF)
    q_const = quality_after(1.0, 24.0, 4.0, PARAMS_BEEF)
    assert abs(q_integral - q_const) < 1e-3


def test_monte_carlo_returns_bounded_probability():
    result = waste_forecast_monte_carlo(
        q_current=0.8, expected_temp_c=4.0, temp_sigma=1.0,
        params=PARAMS_BEEF, hours_ahead=72, runs=2000,
    )
    assert 0.0 <= result["waste_probability"] <= 1.0
    assert result["p05_q"] <= result["mean_q"] <= result["p95_q"]
