# Feature 14: Production Readiness — Feature Plan

**Feature:** Production Readiness
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 5

---

## Goal

Monitoring, logging, error tracking, and operational essentials so the app is production-grade before public beta.

---

## Phase 14.1: Error Tracking (Sentry)

- [ ] **5.2** Set up error tracking (Sentry recommended)
  - Server: `@sentry/node` — unhandled exceptions, request errors
  - Client: `@sentry/vue` — component errors, unhandled rejections
  - Free tier: 5K errors/month (sufficient for alpha)
  - Integrate with existing error handler in `server/src/middlewares/errorHandler.ts`

---

## Phase 14.2: Database Operations (Backups, Migration Strategy, Rollback)

- [ ] **5.1** Add health check endpoint
  - `GET /api/v1/health` — returns `{ status: 'ok', database: 'connected', timestamp: ... }`
  - Check database connectivity
  - Used by Render and CI for deployment verification

- [ ] **5.4** Set up database backups
  - Render Starter PostgreSQL includes daily backups
  - For free tier: cron or manual `pg_dump` script

- [ ] **5.7** Create production database migration strategy
  - How to run migrations on deploy (Render pre-deploy or build script)
  - How to roll back if a migration fails
  - Document the process

- [ ] **5.8** Document and test rollback procedures (see Rollback Plan below)

### Rollback Plan

**Application rollback (Render):**
- Render keeps every deploy as an immutable build. To rollback: service dashboard → Deploys → "Redeploy" on last known-good deploy. ~30 seconds. No code changes.
- Static site: same process.
- **Decision:** Do NOT use auto-deploy initially. Use manual deploy triggers. Once stable, switch to auto-deploy from `main`.

**Database migration rollback:**
- Every migration has `up` and `down`. Run `npm run migrate:undo` to reverse the last migration.
- **Critical rule:** Never run a destructive migration without verifying `down` works locally.
- **Procedure when a migration fails in production:**
  1. Stop the API service (Render → Suspend Service)
  2. Connect to DB via Render Shell or `psql`
  3. Run `npm run migrate:undo`
  4. Redeploy previous application version
  5. Resume API service
  6. Fix migration locally and re-attempt

**Seed data rollback:**
- Seeds should be idempotent (findOrCreate / ON CONFLICT). If reset needed: truncate tables and re-seed, or restore from backup.

**When to rollback vs. hotfix:**
- **Rollback** if: app completely broken (white screen, 500 on all routes, DB corruption).
- **Hotfix** if: one feature broken but rest works — fix code, push, deploy.

---

## Phase 14.3: Monitoring & Logging

- [ ] **5.3** Structured logging for production
  - Production log level `warn` or `info` (not `debug`)
  - Consider request ID in logs for traceability

- [ ] **5.5** Uptime monitoring
  - UptimeRobot (free), Better Uptime, or Render built-in
  - Monitor health check endpoint
  - Email/SMS alerts for downtime

- [ ] **5.6** Review and configure production environment variables
  - Audit all `process.env` in server code
  - Ensure required variables set in Render
  - Google OAuth redirect URIs include production URL

---

**Last Updated:** 2026-02-18
