# Production recovery (goaskhenry.com / Static Web App + API)

Use this if the app shows **“Cannot reach API”** or sign-up returns database errors.

## 1) Backend (Azure App Service)

1. Open the **Web App** that hosts this repo’s `backend` (e.g. `henry-api-...azurewebsites.net`).
2. **Start** the app if it is stopped.
3. **Configuration** → **Application settings** (must be present):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Postgres URL (`?sslmode=require` as provider requires): **Azure Postgres** Flexible Server URI, **or Supabase pooled** (“Session pooler” / `:6543`) for runtime queries
   - `DIRECT_URL` = (**Supabase only**, recommended): the **direct** Postgres URI (`db.*.supabase.co`, `:5432`) copied from Dashboard → Database. `npm start` uses this URL only while running **`prisma migrate deploy`** so migrations succeed; API traffic keeps using pooled `DATABASE_URL`.
   - `JWT_SECRET` = long random string (16+ characters)
   - `CORS_ORIGIN` = `https://goaskhenry.com,https://www.goaskhenry.com` (no trailing slash; add your real SWA URL if different)
4. **Save**, then **Restart** the web app.
5. In a browser, open: `https://<your-api-default-domain>/api/health` — you should get a JSON response. If not, use **Log stream** for errors.

## 2) Frontend (GitHub → Azure Static Web Apps)

1. The UI is **built** with the API base URL. In GitHub: **Settings → Secrets and variables → Actions**:
   - `VITE_API_URL` = **exact** API base, e.g. `https://henry-api-new-xxxxx.centralus-01.azurewebsites.net` (from the Web App **Overview** → **Default domain**), **no** trailing slash.
2. `VITE_API_URL` is **baked in at `npm run build`**. After changing the secret, **re-run the “Azure Static Web Apps CI/CD” workflow** (or push a small commit) so a new `dist` is published.

## 3) Database (PostgreSQL / Supabase)

**Prisma migrations (Henry schema):** Henry uses Prisma (`backend/prisma/migrations/`), not Supabase Dashboard “Migrations”. Apply with either:

- **GitHub:** add secrets **`PRODUCTION_DATABASE_URL`** (+ **`PRODUCTION_DIRECT_URL`** if using a Supabase pooler), then run workflow **“Prisma migrate deploy (production)”** or push to **`main`** (optional migrate step in **Azure App Service — backend API**).
- **Local:** `backend/.env.postgres` → `npm run db:deploy:remote` in `backend/`.
- **Supabase SQL Editor (fallback):** `docs/supabase-apply-henry-schema.sql` — run once, then **`prisma migrate resolve --applied`** for each migration folder (instructions in file header).

If sign-in still mentions **migrate**: confirm **App Service → Log stream** has no **`[startup] prisma migrate deploy failed`**, and **`DIRECT_URL`** is set when using a Supabase pooler (`[prisma-migrate-env]`).

## 4) Quick tests

- API: `GET /api/health` on the App Service default URL.
- API: `GET /api/health/ready` — must be **200** with **`"schema":true`**. If **`503`** and **`code":"SCHEMA_INCOMPLETE"`**, Postgres is up but **Prisma migrations were not applied** (`User` table missing), which matches the live sign-in migrate error.
- Site: open DevTools **Network** tab → try sign-in → the request should go to the **same host** as `VITE_API_URL`.
