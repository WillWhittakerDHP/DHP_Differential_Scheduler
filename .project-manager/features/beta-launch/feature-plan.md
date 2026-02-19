# Feature 15: Beta Launch — Feature Plan

**Feature:** Beta Launch (Hosting & Deployment)
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 0, Phase 1, Appendix A

---

## Goal

Get the codebase merged and the app running in a hosted environment (Render) so beta testers can access it. This feature is the **last MVP feature** — all prerequisites (Features 10–14) must be in place first.

---

## Phase 15.1: Merge & Sanity Check

**Goal:** Ensure the codebase is in a clean, deployable state before any infrastructure work.

**Why:** The feature branch must be merged to `main` and CI/build verified; deployment targets `main`.

### Checklist

- [ ] **0.1** Verify all CI checks pass on current branch
  - Run locally: `cd client && npm run lint && npm run type-check && npm run test`
  - Run locally: `cd server && npm run lint && npx tsc --noEmit && npm run test`
  - Fix any failures before proceeding
- [ ] **0.2** Merge feature branch into `main`
  - Create PR from feature branch → `main`
  - Verify CI passes on the PR
  - Merge (squash or merge commit)
- [ ] **0.3** Verify production build succeeds locally
  - `npm run client:build` — produces `client/dist/` without errors
  - `npm run build:prod` — compiles server TypeScript without errors
  - `npm start` — production mode starts without crashes (Ctrl+C after verifying)
- [ ] **0.4** Verify `client/dist/` serves the SPA correctly
  - Use `npx serve client/dist` (or similar) to preview the production build
  - Confirm the booking wizard loads, admin panel loads, routes work
- [ ] **0.5** Verify PORT handling for Render
  - Confirm `server/src/config/envConfig.ts` reads `process.env.PORT` and doesn't hardcode a port
  - Render assigns PORT dynamically — the server must respect whatever PORT is given
- [ ] **0.6** Verify client API URL is configurable
  - Confirm the Axios/API client uses `VITE_API_BASE_URL` (or similar env var) to construct request URLs
  - In production, the Vite proxy doesn't exist — the client must make requests to the full API URL

---

## Phase 15.2: Render Setup

**Goal:** Get the app running on Render (API + static site + PostgreSQL).

**Why Render:** Managed platform with free/starter tiers for web services, static sites, and PostgreSQL. Supports monorepo. No Docker required. Automatic deploys from GitHub.

**Known limitation (free tier):** Web services sleep after 15 minutes of inactivity; first request has ~30s cold start. For beta with multiple testers, consider Starter tier ($7/mo).

### Checklist

- [ ] **1.1** Create Render account and connect GitHub repository
- [ ] **1.2** Create Render PostgreSQL database instance
  - Render free-tier PostgreSQL expires after 90 days; Starter tier ($7/mo) is persistent
  - Record connection string for environment variables
- [ ] **1.3** Create Render Web Service for the Express API
  - Root directory: `server`
  - Build command: `npm install && npm run build`
  - Start command: `npm start` (or `node dist/server/src/index.js`)
  - Environment: Node 20
  - Add environment variables: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `NODE_ENV=production`, `PORT`, Google OAuth credentials, `CORS_ORIGIN`
- [ ] **1.4** Create Render Static Site for the Vue client
  - Root directory: `client`
  - Build command: `npm install && npm run build`
  - Publish directory: `dist`
  - Add environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`
  - Add rewrite rule: `/* → /index.html` (SPA routing)
- [ ] **1.5** Configure Vite `base` option if deploying to a subdirectory of your business site
  - If hosting at `yourdomain.com/scheduler/`, set `base: '/scheduler/'` in `vite.config.ts`
  - If using a subdomain or Render's default URL, no change needed
- [ ] **1.6** Update CORS configuration in `server/src/app.ts`
  - Replace `app.use(cors())` with explicit origin whitelist
  - Include Render static site URL and localhost for development
- [ ] **1.7** Run database migrations on Render PostgreSQL
  - Use Render Shell or a one-off job to run `npm run migrate`
  - Run `npm run seed` if seed data is needed
- [ ] **1.8** Update Google OAuth redirect URI in Google Cloud Console
  - Add Render API URL to authorized redirect URIs (e.g., `https://your-api.onrender.com/oauth/callback`)
  - Keep `http://localhost:3001/oauth/callback` for local development
- [ ] **1.9** Verify end-to-end: static site loads, API responds, database connected, calendar integration works
- [ ] **1.10** Create `render.yaml` Blueprint (see Phase 15.3)
- [ ] **1.11** Configure custom domain (optional — can use Render's default URLs for alpha)

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting provider | Render | Managed platform, monorepo support, free/starter tiers, auto-deploy from GitHub |
| Database | Render PostgreSQL | Co-located with API, managed backups on paid tier |
| Client hosting | Render Static Site | Free tier, automatic builds, SPA rewrite support |
| Custom domain | Deferred to post-alpha | Render default URLs sufficient for alpha testing |

---

## Phase 15.3: Render Blueprint (Infrastructure as Code)

Full `render.yaml` template and environment variables reference are in **BETA_LAUNCH_CHECKLIST.md Appendix A**. Summary:

- **databases:** One PostgreSQL (e.g. `scheduler-db`, plan starter or free).
- **services:** One `web` (Node) for API — rootDir `server`, buildCommand `npm install && npm run build`, startCommand `node dist/server/src/index.js`, healthCheckPath `/api/v1/health`, envVars from database + NODE_ENV, PORT, CORS_ORIGIN, CLIENT_URL, AUTH_STRATEGY, RESEND_API_KEY, Google OAuth. One `web` (static) for client — rootDir `client`, staticPublishPath `dist`, rewrite `/*` → `/index.html`, envVar `VITE_API_BASE_URL`.

### Environment Variables Needed (Appendix A)

| Variable | Service | Description |
|----------|---------|-------------|
| `NODE_ENV` | API | `production` |
| `PORT` | API | Port for Express (Render assigns dynamically) |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` | API | From Render PostgreSQL |
| `CORS_ORIGIN` | API | Allowed origin(s) for CORS |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | API | Google OAuth |
| `CLIENT_URL` | API | Full URL to client static site (magic link redirects) |
| `AUTH_STRATEGY` | API | `magic_link` (beta) or `password` (production) |
| `RESEND_API_KEY` | API | Resend email provider (magic link emails) |
| `VITE_API_BASE_URL` | Client | Full URL to the API service |

---

**Last Updated:** 2026-02-18
