# FreshFood

Restoran uchun ovqat saqlash kalkulyatori — Arrenius tenglamasi va birinchi tartibli kinetik model asosida har bir mahsulot partiyasining qolgan sifat darajasini real vaqt rejimida hisoblovchi SaaS platforma.

Texnik topshiriq: loyihaning to'liq tavsifi git tarixida saqlangan (commit xabaridagi havola yoki `docs/` papkasiga qarang).

## Stack

- **Backend**: Django 5 + DRF + SimpleJWT + drf-spectacular
- **Math**: NumPy + SciPy (Arrenius, integral, Monte-Carlo)
- **Async**: Celery + Redis (django-celery-beat)
- **DB**: PostgreSQL 15
- **Frontend**: React 18 + Vite + TanStack Query + Zustand + Tailwind

## Tezkor ishga tushirish (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Keyin:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_products
docker compose exec backend python manage.py create_admin
docker compose exec backend python manage.py seed_demo
```

Yoki barchasini bir buyruq bilan:

```bash
docker compose exec backend python manage.py migrate \
  && docker compose exec backend python manage.py seed_products \
  && docker compose exec backend python manage.py create_admin \
  && docker compose exec backend python manage.py seed_demo
```

Default kreditsiallar (env'dan override qilish mumkin):

| | Login | Parol |
|---|---|---|
| Admin (Django admin) | `admin@freshfood.uz` | `admin12345` |
| Demo owner (frontend) | `demo@freshfood.uz` | `demo12345` |

Env'dan: `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`.

- API: http://localhost:8000/api/v1/
- API docs: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/
- Frontend: http://localhost:5173

## Lokal (Docker'siz)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export $(grep -v '^#' ../.env | xargs)
python manage.py migrate
python manage.py runserver
# Frontend
cd frontend
npm install
npm run dev
```

## Test

```bash
cd backend
pytest                                # math_engine birliklash testlari
```

## Loyiha tuzilmasi

```
freshfood/
├── backend/        Django + math_engine + Celery
├── frontend/       Vite + React SPA
├── nginx/          Production reverse proxy
├── docs/           architecture, math-model, api
├── docker-compose.yml
└── .github/workflows/   CI: backend + frontend
```

Batafsil:
- [docs/architecture.md](docs/architecture.md)
- [docs/math-model.md](docs/math-model.md)
- [docs/api.md](docs/api.md)
- [docs/deployment.md](docs/deployment.md) — Railway + Vercel deploy qo'llanmasi

## Sprint 1–2 doirasi (MVP)

- [x] Auth: ro'yxatdan o'tish + JWT login
- [x] Restoran va saqlash joylari CRUD
- [x] Mahsulot shablonlari (6 ta seed)
- [x] Partiya CRUD + consume/waste
- [x] Sensor ingest endpoint
- [x] Dashboard summary
- [x] React SPA: login, register, dashboard, inventar, saqlash
- [x] Math engine: Arrenius + Q(t) + integral + FIFO + Monte-Carlo
- [x] Celery beat schedule (recalculate, alert check)
- [x] Birliklash testlari math_engine uchun

Keyingi sprintlar uchun: Telegram bot, PDF hisobot, prognoz UI, real IoT, POS integratsiya — `docs/` papkasidagi rejaga muvofiq.
