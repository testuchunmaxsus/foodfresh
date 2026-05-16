# Matematik model

## Asosiy tenglama

Birinchi tartibli kinetik model:

$$
\frac{dQ}{dt} = -k(T) \cdot Q
\quad\Longrightarrow\quad
Q(t) = Q_0 \cdot \exp\!\bigl(-\!\int_0^t k(T(s))\,ds\bigr)
$$

Arrenius:

$$
k(T) = A \cdot \exp\!\bigl(-\frac{E_a}{R \cdot T}\bigr),
\quad R = 8.314\ \text{J/(mol·K)}
$$

`T` Kelvinda, `E_a` J/molda.

## Amaliy hisoblash

`apps/math_engine/freshness.py`:

- `arrhenius_rate(T_°C, params)` → `k`
- `quality_after(Q0, hours, T, params)` — doimiy haroratda
- `quality_integral(Q0, readings, now, params)` — haroratlar tarixi bo'yicha trapezoidal integral
- `time_to_critical(Q, T, params)` — `Q_critical` ga yetish vaqti
- `calculate_quality(batch)` — DB dan ma'lumotni olib, real Q(t) ni hisoblaydi
- `fifo_optimization(batches, demand)` — past-Q-birinchi greedy reja
- `waste_forecast_monte_carlo(...)` — temp_sigma flukasiya bilan 10K simulyatsiya

## Validatsiya

Birliklash testlari (`backend/tests/test_freshness.py`) tekshiradi:

- `k` haroratga bog'liq monoton ravishda o'sadi
- `Q(t)` vaqt bo'yicha monoton ravishda kamayadi
- Q10 qoidasi (≈ 2–4 baravar har 10°C ga)
- Doimiy haroratdagi integral ⇔ yopiq formula (xato < 1e-3)
- Monte-Carlo natijasi ehtimollik chegaralarida (0–1)

## Boshlang'ich parametrlar

`backend/scripts/seed_product_templates.py` — ТЗ §2.3 dagi 6 ta mahsulot.
