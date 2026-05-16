# Arxitektura

FreshFood — Django REST + React monolitik SaaS, kelajakda Celery orqali asinxron ish va IoT integratsiyasi qo'shiladi.

## Komponentlar

| Komponent | Vazifa |
|-----------|--------|
| `backend` (Django) | API, autentifikatsiya, biznes logikasi |
| `worker` (Celery) | Q(t) qayta hisoblash, alert generatsiyasi |
| `beat` (Celery beat) | Davriy vazifalar (har 30 daq, har soat, kunlik) |
| `db` (PostgreSQL) | Asosiy ma'lumotlar bazasi |
| `redis` | Cache + Celery broker/result backend |
| `frontend` (Vite + React) | SPA dashboard |
| `nginx` | Reverse proxy (production) |

## Django ilovalari

- `users` — foydalanuvchi modeli (email orqali kirish, JWT)
- `restaurants` — Restaurant va Storage modellari
- `inventory` — Category, ProductTemplate, Batch, ConsumptionLog, Dashboard summary
- `sensors` — TemperatureReading + IoT ingest endpoint
- `alerts` — Alert modeli va ro'yxat
- `reports` — MonthlyReport modeli
- `math_engine` — Arrenius/Q(t) kinetikasi, FIFO, Monte-Carlo

## Ma'lumotlar oqimi

```
[Sensor / Manual ⟶ /sensors/ingest/] ─► TemperatureReading
                                              │
                                              ▼
       ┌──────────────────────────────────────────────┐
       │ Celery beat:                                 │
       │   recalculate_all_qualities (30 daq)         │
       │   check_critical_batches (1 soat)            │
       └──────────────────────────────────────────────┘
                              │
                              ▼
                    Batch.Q_current yangilanadi
                              │
              ┌───────────────┴──────────────┐
              ▼                              ▼
        Alert yaratish              Dashboard summary
```
