# API qisqacha qo'llanma

To'liq spec: `GET /api/schema/` (OpenAPI), interaktiv UI: `/api/docs/`.

## Autentifikatsiya

| Endpoint | Tavsif |
|----------|--------|
| `POST /api/v1/auth/register/` | Ro'yxatdan o'tish |
| `POST /api/v1/auth/login/` | JWT olish (`{access, refresh}`) |
| `POST /api/v1/auth/refresh/` | `access` ni yangilash |
| `GET  /api/v1/auth/me/` | Joriy foydalanuvchi |

Barcha himoyalangan endpointlar `Authorization: Bearer <access>` talab qiladi.

## Restoran va saqlash

- `GET/POST/PATCH /api/v1/restaurants/`
- `GET/POST/PATCH /api/v1/storages/?restaurant=<id>`

## Inventar

- `GET /api/v1/product-templates/` — barcha mahsulot shablonlari (read-only)
- `GET /api/v1/categories/`
- `GET/POST /api/v1/batches/?status=active&ordering=Q_current`
- `POST /api/v1/batches/{id}/consume/` — `{quantity, purpose, note}`
- `POST /api/v1/batches/{id}/waste/` — `{quantity, note}`
- `GET /api/v1/batches/{id}/quality-history/` — grafik uchun nuqtalar

## Sensorlar

- `POST /api/v1/sensors/ingest/` (autentifikatsiyasiz) — `{sensor_id, temperature}`
- `GET /api/v1/temperature-readings/?storage=<id>`

## Alertlar

- `GET /api/v1/alerts/?unread=1`
- `PATCH /api/v1/alerts/{id}/mark-read/`

## Dashboard

- `GET /api/v1/dashboard/summary/` — `{active_batches, critical_batches, total_inventory_value}`
