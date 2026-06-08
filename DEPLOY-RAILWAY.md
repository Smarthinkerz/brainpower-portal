# Deploying the BrainPower AI Investor Portal to Railway

This app is a single Node/Express server that also serves the built React
frontend. It runs as one long-lived container (it has a background reminder job
that must stay alive), which is why **Railway** is a good fit and serverless
hosts like Vercel are not.

This folder is self-contained — it can live in its own GitHub repository and
deploy on its own.

---

## 1. Prerequisites

- A **GitHub** repository containing this folder's contents at the repo root.
- A **Railway** account: https://railway.com
- Your existing service credentials (database, Supabase, etc.). You will copy
  these from your Replit Secrets — see `.env.example` for the full list.

---

## 2. Create the Railway project

1. In Railway, click **New Project → Deploy from GitHub repo**.
2. Select the repository you pushed this code to.
3. Railway detects the `Dockerfile` (and `railway.json`) and builds with it.

---

## 3. Set the environment variables

Open the service → **Variables** tab and add every key listed in `.env.example`
with your real values.

Two important details:

- **`VITE_*` variables are build-time.** Vite bakes them into the frontend
  during the Docker build, so they must exist **before** the first build. Railway
  passes variables to the Docker build automatically, so just add them in the
  Variables tab and redeploy if you added them late.
- **Do not set `PORT`.** Railway injects it automatically and the app reads it.
  `NODE_ENV=production` is already set by the Dockerfile.

Required keys (see `.env.example` for descriptions):

```
DATABASE_URL
JWT_SECRET
OWNER_OPEN_ID
RESEND_API_KEY
OAUTH_SERVER_URL
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
VITE_APP_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_OAUTH_PORTAL_URL
VITE_FRONTEND_FORGE_API_URL
VITE_FRONTEND_FORGE_API_KEY
```

> Keep using your existing **Neon** `DATABASE_URL` so the schema and all current
> data are already in place — no migration step is required on first deploy.

---

## 4. Expose the app & add your domain

1. Service → **Settings → Networking → Generate Domain** to get a
   `*.up.railway.app` URL and confirm it works.
2. To use **brainpowerai.com / brainpowerinvestor.com**, add them under
   **Custom Domains** and create the CNAME records Railway shows you at your DNS
   provider. Railway provisions HTTPS automatically.

---

## 5. Redeploys

Every push to the connected GitHub branch triggers a new build and deploy.

---

## Notes / gotchas

- The AI features, image generation, voice transcription, object storage and the
  Google Maps proxy all call the **built-in Forge API** using
  `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY`. These are external
  managed services; they keep working as long as that key is valid from outside
  Replit. If you later want full independence, swap them for your own provider
  accounts (OpenAI, S3, Google Maps, etc.).
- Health checks hit `/`. If a deploy is marked unhealthy, check the deploy logs
  for a missing required variable (the server throws clear errors naming the
  variable it needs).
