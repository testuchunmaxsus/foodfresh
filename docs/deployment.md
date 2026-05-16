# Deployment — Railway + Vercel

Backend (Django + Celery) va PostgreSQL/Redis — **Railway**'da, frontend (Vite SPA) — **Vercel**'da.

```
┌────────────────────────┐         ┌──────────────────────┐
│  Vercel                │  HTTPS  │  Railway             │
│  (frontend, dist/)     │ ───────►│  web   (gunicorn)    │
│  *.vercel.app          │         │  worker (celery)     │
└────────────────────────┘         │  beat   (celery)     │
                                   │  postgres            │
                                   │  redis               │
                                   └──────────────────────┘
```

---

## 1. Railway — backend + Postgres + Redis

### 1.1. Loyiha yaratish

1. https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Repoyni ulang, branch — `claude/freshfood-storage-calculator-lhdqm` (yoki `main`).
3. Avtomatik yaratilgan service'ni oching → **Settings → Root Directory** = `backend`.
   - Railway `backend/Dockerfile` va `backend/railway.json` ni topadi.

### 1.2. Postgres qo'shish

1. Project ichida **+ New → Database → Add PostgreSQL**.
2. Railway avtomatik `DATABASE_URL` env'ini yaratadi.
3. Backend service'ga ulash: **Variables → Add Reference** → `DATABASE_URL` ni Postgres'dan tanlang.

### 1.3. Redis qo'shish

1. **+ New → Database → Add Redis**.
2. Backend service'ga `REDIS_URL` ni reference qiling.

### 1.4. Environment variables (backend service)

Settings → Variables qismida quyidagilarni qo'shing:

```
DJANGO_SECRET_KEY=<openssl rand -hex 32>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ALLOWED_ORIGINS=https://<sizning-vercel-domeningiz>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<sizning-vercel-domeningiz>.vercel.app
```

`RAILWAY_PUBLIC_DOMAIN` Railway tomonidan avtomatik beriladi (deploy bo'lgandan keyin **Settings → Networking → Generate Domain**).

> `*.vercel.app` preview domeni ham `CORS_ALLOWED_ORIGIN_REGEXES` orqali avtomatik qabul qilinadi (`settings.py` da yozilgan).

### 1.5. Deploy va migratsiya

Birinchi deploy avtomatik:

- `python manage.py migrate --noinput`
- `python manage.py collectstatic --noinput`
- `gunicorn config.wsgi:application`

Buyruq `backend/railway.json` da `startCommand` sifatida yozilgan.

Pre-deploy buyruq avtomatik:

- `migrate`
- `seed_products` — 6 ta mahsulot shabloni (Arrenius parametrlari bilan)
- `create_admin` — Django superuser
- `seed_demo` — demo owner + restoran + 3 ta sovutgich + 7 ta partiya + harorat tarixi

Kreditsiallarni Variables'da o'rnatish (ixtiyoriy):

```
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=<kuchli parol>
DEMO_USER_EMAIL=demo@yourdomain.com
DEMO_USER_PASSWORD=<demo parol>
```

Default: `admin@freshfood.uz` / `admin12345`, `demo@freshfood.uz` / `demo12345`. **Production'da albatta o'zgartiring.**

Buyruqlar idempotent — har deploy'da xavfsiz qayta ishlaydi: superuser parolini yangilaydi, demo restorani allaqachon bo'lsa o'tkazib yuboradi. Demo'ni qayta yaratish: `python manage.py seed_demo --reset` Railway shell'idan.

### 1.6. Celery worker va beat (ixtiyoriy, faqat asinxron vazifalar kerak bo'lganda)

Sprint 1–2 doirasida zaruriy emas. Keyinroq qo'shish:

1. **+ New → Empty Service** → **Connect Repo** → o'sha repo + `backend` root.
2. Settings → **Custom Start Command**: `celery -A config worker -l info`
3. Variables: `DATABASE_URL`, `REDIS_URL` ni reference qiling, qolgan env'lar ham (DJANGO_SECRET_KEY va h.k.).
4. Beat uchun yana bitta service: `celery -A config beat -l info`.

Eslatma: worker/beat service'lari uchun `railway.json`'dagi migratsiya va gunicorn buyruq ishlatilmaydi (custom start command override qiladi).

---

## 2. Vercel — frontend

### 2.1. Import qilish

1. https://vercel.com → **Add New → Project** → GitHub repo'ni tanlang.
2. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (avtomatik aniqlanadi `vercel.json` orqali)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

### 2.2. Environment Variables

Vercel → Project → Settings → Environment Variables:

```
VITE_API_URL=https://<sizning-railway-domeningiz>.up.railway.app/api/v1
```

Production, Preview va Development uchun alohida qiymat qo'yish mumkin.

### 2.3. Deploy

**Deploy** tugmasi → 1–2 daqiqa ichida tayyor. Vercel SPA rewrite'larini `vercel.json` orqali qo'llaydi (barcha yo'llar → `index.html`).

### 2.4. Custom domain (ixtiyoriy)

Vercel → Domains → Add → o'z domeningizni ulang. Keyin Railway'da `CORS_ALLOWED_ORIGINS` va `CSRF_TRUSTED_ORIGINS` ga `https://yourdomain.com` ni qo'shing.

---

## 3. Tekshiruv ro'yxati (smoke test)

Deploy tugagandan keyin:

- [ ] `https://<railway>/api/schema/` — OpenAPI JSON qaytaradi
- [ ] `https://<railway>/admin/` — login sahifasi ochiladi
- [ ] `https://<vercel>/` — Login sahifa
- [ ] Ro'yxatdan o'tish + login ishlaydi (Network tab'da `Authorization: Bearer ...`)
- [ ] Dashboard `summary` endpoint'i 200 qaytaradi
- [ ] CORS xato yo'q (browser console toza)

---

## 4. Ko'p uchraydigan muammolar

| Muammo | Sabab | Yechim |
|--------|-------|--------|
| `CORS error` | Vercel domen Railway env'da yo'q | `CORS_ALLOWED_ORIGINS` ga qo'shing va backend'ni qayta deploy qiling |
| `Bad Request (400)` `/admin/` | `DJANGO_ALLOWED_HOSTS` xato | `${{RAILWAY_PUBLIC_DOMAIN}}` ishlatganingizni tekshiring |
| `CSRF verification failed` | Frontend boshqa domen | `CSRF_TRUSTED_ORIGINS` ga Vercel URL qo'shing |
| Static fayllar 404 | `collectstatic` ishlamagan | Logs → migrate/collectstatic xatosini tekshiring |
| 500 + `DATABASE_URL` | Postgres reference qo'shilmagan | Variables → Add Reference → `DATABASE_URL` |

---

## 5. Sekretlarni boshqarish

- `DJANGO_SECRET_KEY` — har bir env (production/staging) uchun alohida, hech qachon repodan kommit qilmang.
- Generatsiya: `openssl rand -hex 32`
- Lokal `.env` faylini `.gitignore` da saqlang (allaqachon shunday).
