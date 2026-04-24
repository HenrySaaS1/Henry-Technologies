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

