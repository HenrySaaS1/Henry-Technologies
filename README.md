# HENRY Local SaaS Starter

React frontend and Node.js backend scaffold that matches your demo landing page sections.

Use **Node.js 22 LTS** locally (see repository `.nvmrc` and `engines` in `backend/package.json` / `frontend/package.json`). Azure App Service and GitHub Actions in this repo are aligned to Node 22.

## Run locally

1. **Database** — **No PostgreSQL?** Use **SQLite** locally (file only, nothing to install):

   In `backend/.env` set:

   `DATABASE_URL="file:./dev.db"`

   Then:

   ```powershell
   cd backend
   npm install
   npm run db:sqlite
   ```

   If `npm install` hits a Windows **EPERM** on Prisma, stop any running `npm run dev`, then run `npm install` again.

   Azure/production still uses **PostgreSQL**; only your laptop can use SQLite for development.

   **Option A — Cloud Postgres**  
   1. Create a free project at [Neon](https://neon.tech).  
   2. Copy the connection string into `backend/.env` as `DATABASE_URL`.  
   3. Ensure it includes SSL, e.g. append `?sslmode=require` if Neon does not already add it.  
   4. Run `cd backend` then `npx prisma migrate deploy`.

   **Option B — PostgreSQL on Windows**  
   1. Install: `winget install PostgreSQL.PostgreSQL.16` (or use the [EDB installer](https://www.postgresql.org/download/windows/)). Remember the **postgres** superuser password you set.  
   2. Create the app user and database:

   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f scripts/init-henry-db.sql
   ```

   Adjust the path if your version folder is not `16`.  
   3. In `backend/.env` set:

   `DATABASE_URL="postgresql://henry:henry@localhost:5432/henry?schema=public"`

   4. Run `cd backend` then `npx prisma migrate deploy`.

   **Option C — Docker (optional)**  
   If you use Docker later: from the repo root run `docker compose up -d`, then `cd backend` and `npx prisma migrate deploy`.  
   On Windows you can run `cd backend` and `npm run db:setup` to start Compose (when `docker` is installed) and migrate in one step.

2. **Backend**

   - `cd backend`
   - `copy .env.example .env` — set `DATABASE_URL` (see `.env.example`) and a strong `JWT_SECRET`
   - `npm install` (generates Prisma client via `postinstall`; if Windows reports EPERM on Prisma engine files, stop any running `npm run dev`, then run `npm install` again)
   - Create tables: if `DATABASE_URL` starts with `file:` run `npm run db:sqlite`; if PostgreSQL run `npx prisma migrate deploy`
   - `npm run db:seed` (optional — Harland demo user; see `prisma/seed.js` for email/password)
   - `npm run dev`

3. **Frontend** (new terminal)

   - `cd frontend`
   - `npm install`
   - `npm run dev`

Frontend runs at `http://localhost:5173` and API runs at `http://localhost:5000`.

**Dev shortcut:** `npm run dev` opens the **client workspace immediately** without sign-in (preview user). To test real sign-in: copy `frontend/.env.example` to `frontend/.env`, set `VITE_BYPASS_AUTH=false`, keep the default dev **Vite → backend proxy** (same-origin `/api` to `http://127.0.0.1:5000` — start the API first). Do **not** set `VITE_TENANT_SLUG` for localhost (it is ignored; use `?tenant=...` in the URL only if you need workspace filtering). Run `cd backend` and `npm run db:seed` so a local user exists (see `prisma/seed.js`). Production builds do **not** use bypass unless you set `VITE_BYPASS_AUTH=true` at build time.

## API endpoints

- `GET /api/health`
- `GET /api/integrations/odoo/status` — Odoo connection flags (no secrets)
- `GET /api/integrations/odoo/events` — HENRY Events rows from Odoo (signed-in, or local preview)
- `POST /api/integrations/odoo/sync` — upsert dashboard alerts into Odoo `x_henry_events`
- `GET /api/auth/check-email?email=`
- `POST /api/auth/register` — body: `email`, `password`, `company`, `productIds[]`, optional `planId`
- `POST /api/auth/login` — body: `email`, `password`
- `GET /api/auth/me` — header: `Authorization: Bearer <token>`
- `POST /api/contact` — saves to DB; optional same header to attach signed-in user

## Deploy to Azure (GitHub → public website)

You get a **Static Web App** URL for the React site and an **App Service** URL for the API. Wire them together with GitHub secrets and Azure app settings.

### 1. Azure resources (portal)

1. **Resource group** — e.g. `henry-rg`.
2. **Azure Database for PostgreSQL — Flexible Server**
   - Create server + database; allow Azure services (or your App Service outbound IPs) to connect.
   - Connection string for Prisma (replace placeholders):

     `postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require`

3. **App Service (Linux, Node 22 LTS)** — e.g. name `henry-api` → URL `https://henry-api.azurewebsites.net`
   - **Configuration → Application settings** (add as **Application settings**, not only Connection strings):

     | Name | Example |
     |------|---------|
     | `DATABASE_URL` | `postgresql://...?sslmode=require` |
     | `JWT_SECRET` | long random string |
     | `CORS_ORIGIN` | your Static Web App URL (no trailing slash), e.g. `https://happy-rock-012345678.azurestaticapps.net` |
     | `ODOO_URL` | `https://henrytechnologies.odoo.com` |
     | `ODOO_API_KEY` | Odoo user API key (Preferences → Account Security) |
     | `ODOO_EVENTS_MODEL` | `x_henry_events` |
     | `NODE_ENV` | `production` |

   - **Configuration → General settings → Startup Command**: `npm run start`  
     (`start` runs `prisma migrate deploy` then the server.)

   **Production safeguards:** With `NODE_ENV=production`, the API **exits on startup** if settings are wrong: PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET` (16+ characters, not the dev default), and `CORS_ORIGIN` must be your Static Web App URL starting with `https://`. Use **Log stream** on the Web App if the container stops right after deploy.

4. **Static Web App** — connect the **same GitHub repo**; framework “Custom”, or rely on the workflow below.
   - After creation, note the site URL (e.g. `https://<name>.azurestaticapps.net`).

5. **CORS** — set `CORS_ORIGIN` to comma-separated `https://` origins (no trailing slash), e.g. your Static Web App URL **and** any custom domain users open (such as `https://goaskhenry.com`). Production requires at least one valid `https://` origin. The API also allows `https://goaskhenry.com` and `*.goaskhenry.com` in Express once that build is deployed. If the Web App has **Configuration → CORS** entries in the Azure portal, add the same origins there or clear them so the Node app’s CORS rules apply. Redeploy the backend after changes.

### 2. GitHub Actions secrets

In the repo: **Settings → Secrets and variables → Actions**.

**Frontend** (workflow: `.github/workflows/azure-static-web-apps.yml`):

| Secret | Value |
|--------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Portal → your Static Web App → **Manage deployment token** |
| `VITE_API_URL` | Backend public URL, no trailing slash, e.g. `https://henry-api.azurewebsites.net` |

**Backend** (workflow: `.github/workflows/azure-app-service-backend.yml`):

| Secret | Value |
|--------|--------|
| `AZURE_WEBAPP_NAME` | Web App name (e.g. `henry-api`) |
| `AZURE_WEBAPP_BACKEND_PUBLISH_PROFILE` | Entire contents of **Download publish profile** from the Web App |

Push to `main` (or use **Actions → Run workflow**) to deploy. The frontend workflow builds with `npm ci && npm run build` and injects `VITE_API_URL` at build time.

### 3. Custom domain (optional)

- **Static Web App**: Custom domains in the Static Web App resource.
- **App Service**: Custom domains on the Web App; update `CORS_ORIGIN` and GitHub `VITE_API_URL` if the API hostname changes.

### 4. Troubleshooting

- **API 500 / Prisma errors** — check `DATABASE_URL` and firewall; Flexible Server often needs `sslmode=require`.
- **Browser CORS / “Cannot reach API” on the live site while localhost works** — the browser blocks cross-origin calls if the API does not allow `https://goaskhenry.com`. Fix: deploy the latest backend (Express allows that host) and/or add `https://goaskhenry.com` to App Service `CORS_ORIGIN`; align Azure Portal **CORS** with your origins or leave it empty. Then hard-refresh the site.
- **Frontend calls wrong API** — rebuild frontend after changing `VITE_API_URL` (it is baked in at build time).

Link GitHub to Azure using **Deployment Center** on each resource, or use only these workflows once the secrets above are set.
