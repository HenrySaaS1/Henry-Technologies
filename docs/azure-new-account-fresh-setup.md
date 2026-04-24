# HENRY Fresh Azure Setup (New Account + New Domain)

This runbook creates a brand-new production setup in a new Azure account and deploys from GitHub.

Use this target architecture:
- Frontend: Azure Static Web Apps
- Backend API: Azure App Service (Linux)
- Database: Azure Database for PostgreSQL Flexible Server

**Node version:** This project targets **Node.js 22 LTS** (see `backend/package.json` `engines` and repository `.nvmrc`). Node 20 LTS is past Microsoft’s support window for new deployments; use 22 for App Service, CI, and local dev.

---

## 1) Prerequisites

- Access to the new Azure account/subscription
- Admin access to this GitHub repository
- Access to your DNS provider for the new domain
- Azure CLI installed locally (optional but recommended)

Optional local login:

```bash
az login
az account set --subscription "<NEW_SUBSCRIPTION_ID_OR_NAME>"
```

---

## 2) Create Azure resources

Suggested naming (change as needed):
- Resource group: `henry-prod-rg`
- Static Web App: `henry-frontend`
- App Service plan: `henry-api-plan`
- Web App: `henry-api`
- PostgreSQL server: `henry-postgres`
- PostgreSQL database: `henrydb`

### 2.1 Resource group

```bash
az group create --name henry-prod-rg --location eastus
```

### 2.2 PostgreSQL Flexible Server

Use the portal if preferred. If using CLI:

```bash
az postgres flexible-server create \
  --resource-group henry-prod-rg \
  --name henry-postgres \
  --location eastus \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --admin-user henryadmin \
  --admin-password "<STRONG_PASSWORD>" \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0
```

Create DB:

```bash
az postgres flexible-server db create \
  --resource-group henry-prod-rg \
  --server-name henry-postgres \
  --database-name henrydb
```

### 2.3 App Service plan + Web App (backend)

```bash
az appservice plan create \
  --name henry-api-plan \
  --resource-group henry-prod-rg \
  --is-linux \
  --sku B1

az webapp create \
  --name henry-api \
  --resource-group henry-prod-rg \
  --plan henry-api-plan \
  --runtime "NODE:22-lts"
```

### 2.4 Static Web App (frontend)

Create in Azure Portal:
- Service: Static Web Apps
- Name: `henry-frontend`
- Deployment source: GitHub (you can connect now or later)
- Build details:
  - App location: `/frontend`
  - Output location: `dist`

---

## 3) Configure backend app settings (App Service)

In Azure Portal -> `henry-api` -> Configuration -> Application settings:

- `NODE_ENV=production`
- `JWT_SECRET=<long-random-secret>`
- `CORS_ORIGIN=https://<your-frontend-domain>`
- `DATABASE_URL=postgresql://<USER>:<PASSWORD>@henry-postgres.postgres.database.azure.com:5432/henrydb?sslmode=require`
- `CONTACT_NOTIFICATION_TO=<email or comma-separated>`
- `SMTP_HOST=<smtp host>`
- `SMTP_PORT=<465 or 587>`
- `SMTP_SECURE=<true/false>`
- `SMTP_USER=<smtp user>`
- `SMTP_PASS=<smtp pass>`
- `SMTP_FROM=<optional from address>`

Notes:
- Do not set `PORT` manually in App Service Linux.
- This backend uses Prisma migrations during startup (`npm start` path in project docs/workflow comments).

### 3.1 Optional: move an **existing** Web App from Node 20 to Node 22

If the app was created with Node 20, update the stack and restart (pick one: CLI or portal).

**Azure CLI (Linux App Service):**

```bash
az webapp config set \
  --resource-group henry-prod-rg \
  --name henry-api \
  --linux-fx-version "NODE|22-lts"
az webapp restart --resource-group henry-prod-rg --name henry-api
```

**Azure Portal:** App Service → **Configuration** → **General settings** → **Stack** / **Node** version → **22 LTS** → Save → **Restart** the app.

Redeploy your latest code (GitHub Actions or manual) after the runtime change so `npm start` and Prisma run on Node 22.

---

## 4) Update GitHub repository secrets

GitHub -> Settings -> Secrets and variables -> Actions.

Required secrets:
- `AZURE_WEBAPP_NAME` = `henry-api` (or your actual web app name)
- `AZURE_WEBAPP_BACKEND_PUBLISH_PROFILE` = publish profile XML from new `henry-api`
- `AZURE_STATIC_WEB_APPS_API_TOKEN` = deployment token from new Static Web App
- `VITE_API_URL` = `https://henry-api.azurewebsites.net`

Optional:
- `VITE_SITE_GATE_PASSWORD` (preview gate only)

Important:
- Do not store `.env`, publish profiles, or credentials in the repo.

---

## 5) Confirm workflows are aligned

This repo already has:
- `.github/workflows/azure-app-service-backend.yml`
- `.github/workflows/azure-static-web-apps.yml`

They are already configured to:
- Deploy backend from `backend/` using publish profile secret
- Deploy frontend from `frontend/` with build command `npm ci && npm run build`
- Inject `VITE_API_URL` from secrets

Action:
- Push to `main` (or run workflows manually from GitHub Actions) after setting secrets.

---

## 6) Migrate data to new PostgreSQL

If old environment has data:

1. Export from old PostgreSQL:

```bash
pg_dump "<OLD_DATABASE_URL>" --format=custom --file=henry-prod.dump
```

2. Import into new PostgreSQL:

```bash
pg_restore --no-owner --no-privileges --clean --if-exists \
  --dbname="postgresql://<USER>:<PASSWORD>@henry-postgres.postgres.database.azure.com:5432/henrydb?sslmode=require" \
  henry-prod.dump
```

If this is a brand-new environment with no existing data, skip this step.

---

## 7) Validate before domain cutover

Backend:
- Open `https://henry-api.azurewebsites.net/api/health`
- Confirm healthy response

Frontend:
- Open default SWA URL (`https://<random>.azurestaticapps.net`)
- Confirm app loads and API calls succeed

Smoke test checklist:
- Home page loads
- Sign in / sign up flow reachable
- Contact form submit works
- API health endpoint works

---

## 7.1) Production database: run Prisma migrations (required)

The API expects PostgreSQL to match `backend/prisma/migrations/`. If migrations were never applied, or `DATABASE_URL` / firewall is wrong, sign-up and other writes can return:

- `Database is missing required tables or columns. On the server, run: npx prisma migrate deploy (in the backend folder) against DATABASE_URL, then try again.`

**Before anything else, confirm:**

1. **App Service** has `DATABASE_URL` set to your **Azure PostgreSQL** connection string, including **`?sslmode=require`**.
2. **PostgreSQL** → **Networking** allows the App Service to connect (e.g. **Allow public access** with App Service **outgoing IP addresses** added, and/or other rules your org uses).
3. The backend deployment includes the **`prisma/migrations`** folder (this repo’s GitHub App Service workflow deploys the `backend/` app as-is; do not remove migrations from the artifact).

**Apply migrations to the live database (pick one):**

**A — Fast path (inside Azure, usually no long wait) — *recommended***  
1. **Deploy** the latest `main` backend to your App Service (so `prisma/migrations` in the app matches the repo).  
2. Azure Portal → your **App Service (API)** → **Restart** (or **Stop** then **Start**).  
3. On boot, `npm start` runs `prisma migrate deploy` on the same network as PostgreSQL, so the **PostgreSQL firewall** usually only needs to allow this app — not your laptop or GitHub.  
4. Open **Log stream** and confirm the container starts, or that Prisma does not log a migration error.  
5. Retry sign-up on the site.  

**If a GitHub Action sits “in progress” for 10+ minutes, cancel it** — PostgreSQL is often **blocking GitHub’s outbound IPs**, so the run never reaches the server. Use path **A** (restart the API in Azure) or **C** (run `migrate` from your laptop with your IP in the firewall) instead.

**B — GitHub Actions (runs on the public internet, often blocked or slow)**  
1. Add secret **`PRODUCTION_DATABASE_URL`** (same as App Service `DATABASE_URL`).  
2. **Actions** → **Prisma migrate deploy (production)** → **Run workflow**.  
3. **Networking:** if this hangs or times out, use path **A** (recommended), a **self-hosted** runner, or temporarily open PostgreSQL wider for testing. GitHub-hosted runners have **no fixed IP list** for firewall rules.  

(Every **restart** or **deploy** of the web app also runs the same `prisma migrate deploy` via `npm start` before the API process — that is the “remote in Azure” path that does not depend on GitHub.)

**C — One-off from your machine** (Node 22; **add your public IP** to the PostgreSQL server **Firewall rules** in Azure, or the connection will fail with `P1001`)

**Do not** paste the *words* `HOST`, `USER`, `PASSWORD`, or `DATABASE` from examples. The hostname must be your real Azure Flexible Server name, e.g. `henry-postgres` → `henry-postgres.postgres.database.azure.com` (copy from: Azure → PostgreSQL → **Overview** or **Connection strings**). User, password, and database name must be real as well.

**Windows PowerShell (recommended):**

```powershell
cd C:\HENRY\backend
# Paste your real connection string in quotes (from App Service "DATABASE_URL" or Azure connection strings):
$env:DATABASE_URL = "postgresql://YOUR_USER:YOUR_PASSWORD@your-server-name.postgres.database.azure.com:5432/your_database?sslmode=require"
npx prisma migrate deploy
```

If `npx prisma generate` fails on Windows with **`EPERM` / `rename` / `query_engine-windows.dll`**: some other process is locking Prisma (often `npm run dev` in another terminal, Cursor, or real-time antivirus on `node_modules`). **Stop** the backend/frontend dev servers, close extra terminals, then run `npx prisma generate` again, or use **path B (GitHub Actions)** or **path A (Azure restart — no `generate` on your PC)**. In many cases you can still run **`npx prisma migrate deploy`** (above) even if `generate` failed, if the project already has a working generated client from `npm install`.

**Command Prompt (cmd.exe):**

```bat
cd C:\HENRY\backend
set DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@your-server-name.postgres.database.azure.com:5432/your_database?sslmode=require
npx prisma migrate deploy
```

**macOS / Linux (bash):**

```bash
cd backend
export DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@your-server-name.postgres.database.azure.com:5432/your_database?sslmode=require"
npx prisma migrate deploy
```

**D — In App Service SSH** (if enabled)  
`cd` to the deployed site root (for example `site/wwwroot`), set `DATABASE_URL` if not inherited, then:

```bash
npx prisma migrate deploy
```

After migrations succeed, **Restart** the web app and retry sign-up on your `.com` site.

**Verify schema (optional):** connect with `psql` and list tables: `User` should have columns such as `onboardingData` and `onboardingCompletedAt` after the latest migrations.

---

## 8) Configure new custom domain

For frontend domain on Static Web Apps:

1. Azure Portal -> Static Web App -> Custom domains -> Add
2. Add DNS records in your DNS provider as requested by Azure
   - usually `CNAME` for `www`
   - root/apex depends on provider (ALIAS/ANAME/flattening)
3. Wait for domain validation and managed TLS issuance

For backend custom domain (optional):
- App Service -> Custom domains -> Add domain
- Add certificate (App Service Managed Certificate or your own)

---

## 9) Cutover and rollback plan

Cutover:
1. Lower DNS TTL (for example 300 seconds) before cutover window
2. Point DNS to new frontend
3. Re-test full user flow

Rollback:
1. Keep old environment online for 48-72 hours
2. If problems occur, point DNS back to old environment
3. Fix new setup, re-test, and cut over again

---

## 10) Post-cutover hardening

- Rotate any temporary/shared passwords
- Restrict PostgreSQL firewall rules to least privilege
- Enable App Service log stream / diagnostics
- Set Azure budget + alerts in new subscription
- Document final values in your operations handover file (without secrets)

---

## Quick reference: values from this repo

- Frontend build env key: `VITE_API_URL`
- Frontend optional gate key: `VITE_SITE_GATE_PASSWORD`
- Backend deploy secrets:
  - `AZURE_WEBAPP_NAME`
  - `AZURE_WEBAPP_BACKEND_PUBLISH_PROFILE`
- Frontend deploy secret:
  - `AZURE_STATIC_WEB_APPS_API_TOKEN`

