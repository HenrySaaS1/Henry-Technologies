# Production recovery (goaskhenry.com / Static Web App + API)

Use this if the app shows **“Cannot reach API”** or sign-up returns database errors.

## 1) Backend (Azure App Service)

1. Open the **Web App** that hosts this repo’s `backend` (e.g. `henry-api-...azurewebsites.net`).
2. **Start** the app if it is stopped.
3. **Configuration** → **Application settings** (must be present):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your Azure PostgreSQL URL with `?sslmode=require`
   - `JWT_SECRET` = long random string (16+ characters)
   - `CORS_ORIGIN` = `https://goaskhenry.com,https://www.goaskhenry.com` (no trailing slash; add your real SWA URL if different)
4. **Save**, then **Restart** the web app.
5. In a browser, open: `https://<your-api-default-domain>/api/health` — you should get a JSON response. If not, use **Log stream** for errors.

## 2) Frontend (GitHub → Azure Static Web Apps)

1. The UI is **built** with the API base URL. In GitHub: **Settings → Secrets and variables → Actions**:
   - `VITE_API_URL` = **exact** API base, e.g. `https://henry-api-new-xxxxx.centralus-01.azurewebsites.net` (from the Web App **Overview** → **Default domain**), **no** trailing slash.
2. `VITE_API_URL` is **baked in at `npm run build`**. After changing the secret, **re-run the “Azure Static Web Apps CI/CD” workflow** (or push a small commit) so a new `dist` is published.

## 3) Database (PostgreSQL)

If sign-up still says **missing tables or columns**: apply migrations to the same database as `DATABASE_URL` (see `azure-new-account-fresh-setup.md` §7.1). The preferred low-friction path is **Restart the App Service** so `npm start` runs `prisma migrate deploy` from inside Azure.

## 4) Quick tests

- API: `GET /api/health` on the App Service default URL.
- Site: open DevTools **Network** tab → try sign-in → the request should go to the **same host** as `VITE_API_URL`.
