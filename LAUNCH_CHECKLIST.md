# DHP Differential Scheduler — Launch Checklist

**Purpose:** Master checklist and ordered todo list for preparing the Differential Scheduler for alpha and beta launch. This document is designed to be revisited across multiple Cursor sessions and serves as the single tracking artifact for launch readiness.

**Alpha vs Beta:** Phases 0–1 (Merge, Hosting) get you **Alpha Ready** — app deployed, you can use it end-to-end. **Between Alpha and Beta** we do the UI overhaul (Feature 17: wizard + admin), migration to Ionic for Vue for those surfaces, and the native app path (Ionic → Capacitor → iOS/Android → App Store / Play Store). See the "Between Alpha and Beta" section and Phase 7 for conversion and launch steps. After that, Phases 2–6 add auth, testing, polish, and guided testers for **Beta Ready**. Later phases (Production Ready, etc.) follow. Use the **Milestones** table below to see which phases map to Alpha vs Beta.

**Created:** 2026-02-18
**Last Updated:** 2026-02-27 (Between Alpha and Beta: UI overhaul, Ionic migration, native app path; Phase 7 conversion/launch steps and commentary)
**Status:** Active — Pre-Launch Planning
**Hosting Target:** Render (API + static site)
**Related:** `.project-manager/PROJECT_PLAN.md` (feature development tracking)

---

## How to Use This Document

### Checking Off Items

Each todo and checklist item uses standard Markdown checkboxes:
- `[ ]` = Not started
- `[x]` = Complete

When working in a Cursor session, tell the agent:
> "Open LAUNCH_CHECKLIST.md and mark item X.Y as complete"

or:
> "Update LAUNCH_CHECKLIST.md — I've finished items 2.1 through 2.4"

The agent will use `StrReplace` to change `[ ]` to `[x]` for the specified items.

### Working Across Multiple Sessions

This document is self-contained. At the start of any new session, reference it like this:

> "@LAUNCH_CHECKLIST.md — Continue with the next incomplete item in the ordered todo list"

The agent will read the file, find the first unchecked item, and pick up where you left off.

### Relationship to Project Manager

This checklist covers **infrastructure, deployment, testing, and security** — the work needed to go from "working locally" to "running in production for beta users." It does NOT replace `.project-manager/PROJECT_PLAN.md`, which tracks **feature development** (data flow alignment, booking calculations, calendar availability, UI polish, etc.).

Think of it this way:
- **PROJECT_PLAN.md** = "What does the app do?" (features)
- **LAUNCH_CHECKLIST.md** = "Can we ship it safely?" (infrastructure)

Some items here will become features documented in `.project-manager/features/` — particularly the test suite setup, which should get its own feature plan.

### Using Cursor Subagents

Cursor supports subagents — specialized agents that can be launched from the primary agent to handle specific tasks in parallel or independently. Here is how to use them effectively for this checklist:

**What subagents are:** When you ask the primary agent to do something complex, it can spawn "sub-agents" that each handle a piece of the work. For example, if you ask the agent to explore your codebase, it might launch an `explore` subagent that specializes in fast file searching, while using a `generalPurpose` subagent for deeper analysis.

**How this helps with the checklist:**
- The primary agent reads this checklist and orchestrates the work
- It can launch subagents to explore code, run searches, or handle implementation tasks in parallel
- You stay in one conversation thread — the primary agent manages the subagents

**Recommended workflow:**
1. Start a session referencing this file: `@LAUNCH_CHECKLIST.md`
2. The agent reads the checklist and identifies the next work item
3. For complex items, the agent may launch subagents to gather context before implementing
4. You review and approve changes
5. Before ending the session, ask the agent to update this checklist with progress

**When to use separate threads instead:**
- If you want to work on two completely unrelated items simultaneously (e.g., security + UI polish)
- If a single thread's context gets too long (after ~15-20 back-and-forth exchanges)
- If you want a fresh perspective on a problem

**When to stay in one thread with subagents:**
- Sequential work through the ordered todo list (recommended for most items)
- Items that depend on each other (e.g., hosting setup before deployment pipeline)
- When you want the agent to maintain full context of what's been done

---

## Architecture Overview

### Current Stack
```
Monorepo Root
├── client/           Vue 3 + Vite + Vuetify + TypeScript (SPA)
│   ├── Pinia         State management
│   ├── Vue Query     Server state / caching
│   ├── VeeValidate   Form validation
│   └── Vitest        Unit tests (117 test files)
├── server/           Express.js + TypeScript + Sequelize
│   ├── PostgreSQL    Database (Sequelize ORM)
│   ├── Jest          Unit tests (15 test files)
│   ├── Helmet        Security headers
│   └── Morgan        HTTP logging
└── .github/workflows/ci.yml   GitHub Actions CI
```

### Current Data Flow
```
Browser → Vue SPA (port 3002) → Vite Proxy → Express API (port 3001) → PostgreSQL
                                                    ↕
                                            Google Calendar API
                                            Google Maps API
                                            Bright MLS API
```

### Target Data Flow (With Auth)
```
Browser → Vue SPA
  ├── /auth              → AuthView (MagicLinkForm or PasswordLoginForm)
  ├── /auth/verify       → MagicLinkVerifyView (token verification)
  └── /* (protected)     → Router guard checks session → redirects to /auth if needed
         ↓
    Express API
      ├── POST /api/v1/auth/magic-link  → emailService → user's inbox
      ├── POST /api/v1/auth/verify      → sessions table → httpOnly cookie
      ├── GET  /api/v1/auth/me          → requireAuth middleware → session lookup
      ├── POST /api/v1/auth/logout      → destroy session
      └── /api/v1/internal/*            → requireAuth → requireRole → handler
```

### Target Production Architecture (Render)
```
User Browser
    ↓
Render Static Site (Vue SPA)
    ↓ VITE_API_BASE_URL
Render Web Service (Express API)
    ↓
Render PostgreSQL (or external DB)
    ↕
Google Calendar API / Google Maps API
```

### What Exists Today
- **CI Pipeline:** GitHub Actions — lint, typecheck, test, build (client + server)
- **Tests:** 117 client unit tests (Vitest), 15 server unit tests (Jest)
- **Security:** Helmet headers, security middleware stubs (auth not implemented), rate limiting for external APIs only
- **Caching:** Calendar events, drive time, geocoding, property enrichment (all server-side in-memory)
- **Property Enrichment:** Infrastructure built (Bright MLS transformer, mappings, admin UI, client integration); API credentials **not yet connected** — Bright MLS provider requires beta launch before issuing credentials
- **Logging:** Custom logger with scoped debug, Morgan for HTTP requests
- **Error Handling:** Global Express error handler, client console error filtering
- **Beta Feedback:** Full system (model, API, UI widget, admin dashboard)
- **Google Integration:** OAuth2, Calendar events, Maps geocoding/drive-time, rate limiting

### What Does NOT Exist Yet
- No deployment configuration (no Dockerfile, no render.yaml, no hosting config)
- No production database
- No authentication (middleware stubs are no-ops — see Phase 2A for full implementation plan)
- No CORS restrictions (allows all origins)
- No API rate limiting for internal routes
- No E2E tests
- No error tracking / monitoring (no Sentry)
- No health check endpoint
- No production environment variable management
- No beta tester onboarding / guided testing system (see Phase 6A for full design)
- No email/notification system (Phase 2A adds transactional email for magic links)
- No native app shell (no Capacitor, no PWA — see Phase 7 for Capacitor + Ionic strategy)
- No admin override for availability blockers (see Phase 8A for force-create + blocker exception records)

---

## Milestones

| Milestone | Definition of Done | Corresponds To |
|-----------|-------------------|----------------|
| **Alpha Ready** | App deployed on Render, auth working, core booking + admin flows functional. You (Will) can use it end-to-end from a browser that isn't localhost. No external testers yet. | P0 + P1 complete (items #0–#23) |
| **Post-Alpha Ready (Between Alpha and Beta)** | Feature 17 (Admin UI Overhaul) complete; wizard and admin migrated to Ionic for Vue as planned; Capacitor wrap of Ionic app; iOS/Android builds and store submission path ready. See "Between Alpha and Beta" and Phase 7. | Feature 17 + Phase 7 Stage 2 + conversion/launch steps |
| **Beta Ready** | E2E tests cover critical paths, error tracking live, guided testing system seeded, testers can log in via magic link, submit feedback, and follow assigned test tasks. Ready to invite 5–10 trusted testers (web and/or native app). | P0 + P1 + P2 + P3 + P4 complete (items #0–#69) |
| **Production Ready** | Password auth, full test coverage, custom domain, polished UI, rollback procedures documented and tested. Ready for public access. | All priorities complete (P0–P5) |
| **Native App Ready** | Ionic-based app wrapped in Capacitor, running on iOS simulator + Android emulator, connected to production API. Ready for App Store / Play Store submission. | Phase 7 complete (Capacitor + Ionic path; items #83–#92 and conversion steps) |

---

## Between Alpha and Beta: UI Overhaul, Ionic Migration & Native App Path

**Goal:** After Alpha Ready, before inviting beta testers, complete the UI overhaul (wizard + admin), migrate those surfaces to Ionic for Vue, and establish the native app path so the Apple Store (and optionally Play Store) version is the Ionic-based app.

**Why between alpha and beta:** Alpha validates that the app works end-to-end in a browser. The next step is to ship a single, coherent experience for beta: redesigned UI and a native app built from the same codebase (Ionic). Doing the overhaul and Ionic migration before beta avoids maintaining two UIs and lets testers use either web or the native app from day one of beta.

**Sequence:**
1. **Feature 17 (Admin UI Overhaul)** — Redesign admin interface and wizard UX; reduce and simplify components (see PROJECT_PLAN.md Feature 17).
2. **Ionic Vue migration** — Migrate booking wizard (and admin, as scoped) to Ionic Vue components; composables and API usage unchanged. Admin can stay Vuetify if preferred; wizard is the priority for native-feel.
3. **Capacitor wrap** — Add Capacitor, point at the built client; add iOS and Android platforms. The native app loads the same Ionic (or hybrid) build.
4. **Build and validate** — Run in iOS simulator and Android emulator; verify booking flow and API connectivity.
5. **Store path** — Prepare App Store / Play Store metadata, signing, and submission. See Phase 7 "Converting to and launching the app version" below for step-by-step commentary.

**References:** PROJECT_PLAN.md (Feature 17, Native App Shell section); Phase 7 below (Stage 1 + Stage 2 + conversion/launch subsection).

---

## Phase 0: Merge & Sanity Check

**Goal:** Ensure the codebase is in a clean, deployable state before any infrastructure work begins.

**Why:** The `feature/google-apis-integration` branch has 33+ commits not in `main`. CI only triggers on `main`/`master`. All deployment will target `main`, so the branch must be merged and verified first.

### Checklist

- [ ] **0.1** Verify all CI checks pass on current branch
  - Run locally: `cd client && npm run lint && npm run type-check && npm run test`
  - Run locally: `cd server && npm run lint && npx tsc --noEmit && npm run test`
  - Fix any failures before proceeding
- [ ] **0.2** Merge `feature/google-apis-integration` into `main`
  - Create PR from `feature/google-apis-integration` → `main`
  - Verify CI passes on the PR
  - Merge (squash or merge commit — your preference)
- [ ] **0.3** Verify production build succeeds locally
  - `npm run client:build` — produces `client/dist/` without errors
  - `npm run build:prod` — compiles server TypeScript without errors
  - `npm start` — production mode starts without crashes (can Ctrl+C after verifying)
- [ ] **0.4** Verify `client/dist/` serves the SPA correctly
  - Use `npx serve client/dist` (or similar) to preview the production build
  - Confirm the booking wizard loads, admin panel loads, routes work
- [ ] **0.5** Verify PORT handling for Render
  - Confirm `server/src/config/envConfig.ts` reads `process.env.PORT` and doesn't hardcode a port
  - Render assigns PORT dynamically — the server must respect whatever PORT is given
- [ ] **0.6** Verify client API URL is configurable
  - Confirm the Axios/API client in `client/src/utils/api/` uses `VITE_API_BASE_URL` (or similar env var) to construct request URLs
  - In production, the Vite proxy doesn't exist — the client must make requests to the full API URL
  - If the client currently only uses relative paths like `/api/v1/...`, those will 404 against the static site host

---

## Phase 1: Hosting & Deployment (Render)

**Goal:** Get the app running in a hosted environment so beta testers can access it.

**Why Render:** Managed platform with free/starter tiers for web services, static sites, and PostgreSQL. Supports monorepo deployments. No Docker required (though supported). Automatic deploys from GitHub.

**Known limitation (free tier):** Render free-tier web services sleep after 15 minutes of inactivity. First request after sleep has a ~30-second cold start. For alpha testing (just you), this is acceptable. For beta with multiple testers, consider Starter tier ($7/mo) to avoid cold starts.

### Checklist

- [ ] **1.1** Create Render account and connect GitHub repository
- [ ] **1.2** Create Render PostgreSQL database instance
  - Note: Render free-tier PostgreSQL expires after 90 days; Starter tier ($7/mo) is persistent
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
  - If using a subdomain (`beta.yourdomain.com`) or Render's default URL, no change needed
- [ ] **1.6** Update CORS configuration in `server/src/app.ts`
  - Replace `app.use(cors())` with explicit origin whitelist
  - Include Render static site URL and localhost for development
- [ ] **1.7** Run database migrations on Render PostgreSQL
  - Use Render Shell or a one-off job to run `npm run migrate`
  - Run `npm run seed` if seed data is needed
- [ ] **1.8** Update Google OAuth redirect URI in Google Cloud Console
  - Add Render API URL to authorized redirect URIs (e.g., `https://your-api.onrender.com/oauth/callback`)
  - Keep `http://localhost:3001/oauth/callback` for local development
  - Without this, Google Calendar integration will fail in production
- [ ] **1.9** Verify end-to-end: static site loads, API responds, database connected, calendar integration works
- [ ] **1.10** Create `render.yaml` Blueprint (Infrastructure as Code) for reproducible deploys
  - Defines all services, databases, and environment groups in one file
  - Enables one-click environment recreation
- [ ] **1.11** Configure custom domain (optional — can use Render's default URLs for alpha)
  - Point subdomain DNS to Render
  - Configure SSL (Render handles this automatically)

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting provider | Render | Managed platform, monorepo support, free/starter tiers, auto-deploy from GitHub |
| Database | Render PostgreSQL | Co-located with API, managed backups on paid tier |
| Client hosting | Render Static Site | Free tier, automatic builds, SPA rewrite support |
| Custom domain | Deferred to post-alpha | Render default URLs sufficient for alpha testing |

---

## Phase 2: Security Hardening

**Goal:** Protect the API and data before exposing it to any external users, even trusted alpha testers.

### Checklist

- [ ] **2.1** Implement authentication (Strategy Pattern — see **Phase 2A** below for full details)
  - Shared infrastructure: sessions table, session manager, `requireAuth` middleware
  - Beta: Magic Link strategy (passwordless email verification)
  - Production: Password strategy (email + bcrypt hashed password)
  - Environment-based routing in `server/src/auth/authConfig.ts`
  - Protects all `/api/v1/internal/*` mutation endpoints (POST/PUT/DELETE)
  - Implement in `server/src/middlewares/security.ts` (stubs already wired in)
- [ ] **2.2** Lock down CORS to specific origins
  - Production: Render static site URL only
  - Development: `http://localhost:3002`
  - Use environment variable `CORS_ORIGIN` to configure per environment
- [ ] **2.3** Add API rate limiting for internal routes
  - Install `express-rate-limit`
  - Apply to all `/api/v1/internal/*` routes
  - Suggested: 100 requests per 15 minutes per IP for general routes, 10 per 15 minutes for auth routes
- [ ] **2.4** Add request validation / input sanitization
  - Joi validation on all POST/PUT request bodies (some already exists)
  - Audit all route handlers for missing validation
- [ ] **2.5** Audit environment variables — ensure no secrets in committed files
  - Verify `.gitignore` covers all `.env.*` files (except `.env.example`)
  - Verify `.google-tokens.json` is gitignored
  - Check for any hardcoded credentials in source
- [ ] **2.6** Add security response headers review
  - Helmet is already installed — verify configuration is production-appropriate
  - Consider adding `Content-Security-Policy` header
- [ ] **2.7** Implement CSRF protection (if using session-based auth)
  - Only needed if using cookies/sessions, not needed for API-key or Bearer token auth

### Security Notes for Alpha

Phase 2A defines the full authentication strategy. For alpha/beta, Magic Link authentication provides email collection, role-based access, and session management without passwords. The critical thing is that the admin panel and mutation endpoints are not publicly accessible — `requireAuth` + `requireRole` middleware handles this. See Phase 2A below for implementation details.

---

## Phase 2A: Authentication & User Identity (Strategy Pattern)

**Goal:** Collect user data during beta, enable role-based access, and auto-populate returning users — while building an architecture that swaps from passwordless (beta) to full password auth (production) via environment config alone.

**Why Strategy Pattern:** Both Magic Link and Password auth end at the same place — a session for an authenticated user. They only differ in *how* the user proves their identity. Building one shared session/middleware layer with pluggable "proof of identity" strategies means the swap from beta to production auth requires zero rework of middleware, stores, router guards, or API contracts.

**Architecture Decision:** Session tokens in PostgreSQL (not JWT). Revocation is trivial (delete the row), no signing infrastructure needed, and the upgrade to JWT later (if needed) changes only `sessionManager.ts` internals — the API contract stays identical.

### Architecture

```
Authentication Strategy Pattern
─────────────────────────────────────────────────────────

  SHARED INFRASTRUCTURE (built once, used by both strategies)
  ├── sessions table (PostgreSQL)
  ├── sessionManager.ts — createSession, validateSession, destroySession
  ├── requireAuth middleware — reads session token, attaches req.user
  ├── authRouter.ts — mounts active strategy's routes + shared routes
  ├── Auth Pinia store — holds current user, identify/logout actions
  └── Vue Router guards — redirect unauthenticated users

  STRATEGY: MAGIC LINK (beta / development)                STRATEGY: PASSWORD (production)
  ├── magic_links table                                    ├── login table (email + password_hash)
  ├── magicLinkStrategy.ts                                 ├── passwordStrategy.ts
  │   ├── POST /auth/magic-link  → send email              │   ├── POST /auth/register → hash + create
  │   └── GET  /auth/verify      → verify token            │   └── POST /auth/login    → verify hash
  ├── emailService.ts (Resend/SendGrid)                    ├── Password reset flow
  └── MagicLinkForm.vue                                    └── PasswordLoginForm.vue

  ENVIRONMENT ROUTING (authConfig.ts)
  ├── NODE_ENV === 'production'  → PasswordStrategy
  └── NODE_ENV !== 'production'  → MagicLinkStrategy

  SHARED ROUTES (always available, both strategies)
  ├── GET  /auth/me      → return current user from session
  ├── POST /auth/logout   → destroy session
  └── GET  /auth/config   → return { strategyName, requiresPassword }
```

### Data Flow

```
MAGIC LINK FLOW (beta):
  User enters email → POST /auth/magic-link → server creates token in magic_links table
  → server sends email with link → user clicks link → GET /auth/verify?token=xxx
  → server validates token → server creates session → sets httpOnly cookie → redirects to app

PASSWORD FLOW (production):
  User enters email + password → POST /auth/login → server finds login record
  → bcrypt.compare(password, hash) → server creates session → sets httpOnly cookie → returns user

BOTH FLOWS CONVERGE HERE:
  Any subsequent request → requireAuth middleware → reads cookie → looks up session
  → attaches req.user → route handler has full user context
```

### File Structure (New Files)

```
server/src/
  auth/
    strategies/
      strategyTypes.ts          ← Interface both strategies implement
      magicLinkStrategy.ts      ← Beta: generate link, verify link
      passwordStrategy.ts       ← Production: register, login (implement later)
    authRouter.ts               ← Routes that delegate to active strategy
    authConfig.ts               ← Reads NODE_ENV, exports active strategy
    sessionManager.ts           ← Shared: create/validate/destroy sessions
    emailService.ts             ← Send transactional emails (magic links, etc.)
  db/
    models/
      auth/
        Session.ts              ← Session model
        MagicLink.ts            ← Magic link token model
    migrations/
      20260219_100000_create_auth_tables.mjs  ← Sessions + magic_links tables

client/src/
  stores/
    auth.ts                     ← Pinia auth store (useAuthStore)
  views/
    auth/
      AuthView.vue              ← Container: renders correct form based on strategy
      MagicLinkForm.vue         ← Email-only input → request magic link
      MagicLinkVerifyView.vue   ← Landing page for magic link clicks
      PasswordLoginForm.vue     ← Email + password (implement later)
  composables/
    auth/
      useAuth.ts                ← Auth composable wrapping the store
```

### Checklist

#### Shared Infrastructure (Both Strategies)

- [ ] **2A.1** Create database migration for `sessions` and `magic_links` tables

  Migration file: `server/src/db/migrations/20260219_100000_create_auth_tables.mjs`

  ```javascript
  export default {
    async up(queryInterface, _Sequelize) {
      // Sessions table — shared by both auth strategies
      await queryInterface.sequelize.query(`
        CREATE TABLE public.sessions (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid NOT NULL,
          token varchar(255) NOT NULL,
          expires_at timestamptz NOT NULL,
          last_active_at timestamptz DEFAULT CURRENT_TIMESTAMP,
          created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
          CONSTRAINT sessions_pkey PRIMARY KEY (id),
          CONSTRAINT sessions_token_key UNIQUE (token),
          CONSTRAINT sessions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.users(id)
            ON UPDATE CASCADE ON DELETE CASCADE
        );
      `);
      await queryInterface.sequelize.query(`
        CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);
      `);
      await queryInterface.sequelize.query(`
        CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);
      `);
      await queryInterface.sequelize.query(`
        CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);
      `);

      // Magic links table — used by MagicLinkStrategy (beta/development)
      await queryInterface.sequelize.query(`
        CREATE TABLE public.magic_links (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid NOT NULL,
          token varchar(255) NOT NULL,
          expires_at timestamptz NOT NULL,
          used_at timestamptz,
          created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
          CONSTRAINT magic_links_pkey PRIMARY KEY (id),
          CONSTRAINT magic_links_token_key UNIQUE (token),
          CONSTRAINT magic_links_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.users(id)
            ON UPDATE CASCADE ON DELETE CASCADE
        );
      `);
      await queryInterface.sequelize.query(`
        CREATE INDEX magic_links_token_idx ON public.magic_links USING btree (token);
      `);
    },

    async down(queryInterface, _Sequelize) {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS public.magic_links;');
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS public.sessions;');
    }
  }
  ```

- [ ] **2A.2** Create Sequelize models: `Session` and `MagicLink`

  `server/src/db/models/auth/Session.ts` — follows existing model patterns (factory, snake_case fields):

  ```typescript
  import {
    Model, DataTypes, InferAttributes, InferCreationAttributes,
    CreationOptional, ForeignKey, Sequelize,
  } from 'sequelize';

  export class Session extends Model<
    InferAttributes<Session>,
    InferCreationAttributes<Session>
  > {
    declare id: CreationOptional<string>;
    declare userId: ForeignKey<string>;
    declare token: string;
    declare expiresAt: Date;
    declare lastActiveAt: CreationOptional<Date>;
    declare createdAt: CreationOptional<Date>;
  }

  export function SessionFactory(sequelize: Sequelize): typeof Session {
    Session.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        token: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'expires_at',
        },
        lastActiveAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          field: 'last_active_at',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          field: 'created_at',
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        schema: 'public',
        modelName: 'session',
        tableName: 'sessions',
        freezeTableName: true,
      }
    );
    return Session;
  }
  ```

  `server/src/db/models/auth/MagicLink.ts` — same pattern:

  ```typescript
  import {
    Model, DataTypes, InferAttributes, InferCreationAttributes,
    CreationOptional, ForeignKey, Sequelize,
  } from 'sequelize';

  export class MagicLink extends Model<
    InferAttributes<MagicLink>,
    InferCreationAttributes<MagicLink>
  > {
    declare id: CreationOptional<string>;
    declare userId: ForeignKey<string>;
    declare token: string;
    declare expiresAt: Date;
    declare usedAt: CreationOptional<Date | null>;
    declare createdAt: CreationOptional<Date>;
  }

  export function MagicLinkFactory(sequelize: Sequelize): typeof MagicLink {
    MagicLink.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'user_id',
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        token: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'expires_at',
        },
        usedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'used_at',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          field: 'created_at',
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        schema: 'public',
        modelName: 'magic_link',
        tableName: 'magic_links',
        freezeTableName: true,
      }
    );
    return MagicLink;
  }
  ```

- [ ] **2A.3** Register models in `server/src/db/models/index.ts`

  Add `SessionFactory(sequelize)` and `MagicLinkFactory(sequelize)` alongside existing model registrations.

- [ ] **2A.4** Create auth strategy interface (`server/src/auth/strategies/strategyTypes.ts`)

  This is the contract that both strategies must implement:

  ```typescript
  import { Router } from 'express';

  /** Auth strategy names — used by client to render the correct form */
  export type AuthStrategyName = 'magic_link' | 'password';

  /** Configuration returned to the client so it knows which UI to render */
  export interface AuthClientConfig {
    strategyName: AuthStrategyName;
    requiresPassword: boolean;
  }

  /**
   * PATTERN: Strategy interface — both MagicLinkStrategy and PasswordStrategy
   * implement this contract. The authRouter delegates to whichever is active.
   */
  export interface AuthStrategy {
    /** Human-readable name for logging */
    readonly name: AuthStrategyName;

    /**
     * Returns an Express router with strategy-specific routes.
     * Magic link: POST /magic-link, GET /verify
     * Password:   POST /register, POST /login
     */
    getRoutes(): Router;

    /** Returns config for the client to know which form to render */
    getClientConfig(): AuthClientConfig;
  }
  ```

- [ ] **2A.5** Create session manager (`server/src/auth/sessionManager.ts`)

  Shared session logic used by both strategies after identity is verified:

  ```typescript
  import crypto from 'node:crypto';
  import { Op } from 'sequelize';
  import { Session } from '../db/models/auth/Session.js';
  import { User } from '../db/models/participantModels/Users.js';
  import { createLogger } from '../utils/logger.js';

  const logger = createLogger('SessionManager');

  const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  export interface SessionUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userRole: string;
  }

  /** Generate a cryptographically secure random token */
  function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /** Create a new session for a verified user. Returns the session token. */
  export async function createSession(userId: string): Promise<string> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await Session.create({ userId, token, expiresAt });
    logger.debug(`Session created for user ${userId}`);
    return token;
  }

  /** Validate a session token. Returns the user if valid, null if expired/missing. */
  export async function validateSession(token: string): Promise<SessionUser | null> {
    const session = await Session.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!session) return null;

    const user = await User.findByPk(session.userId);
    if (!user) return null;

    // Touch last_active_at (fire-and-forget, don't block the request)
    session.update({ lastActiveAt: new Date() }).catch((error: unknown) => {
      logger.warn('Failed to update session last_active_at:', error);
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userRole: user.userRole,
    };
  }

  /** Destroy a session (logout) */
  export async function destroySession(token: string): Promise<void> {
    await Session.destroy({ where: { token } });
  }

  /** Clean up expired sessions (call periodically or via cron) */
  export async function cleanExpiredSessions(): Promise<number> {
    const deleted = await Session.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } },
    });
    logger.debug(`Cleaned ${deleted} expired sessions`);
    return deleted;
  }
  ```

  **Session cleanup:** Call `cleanExpiredSessions()` on a periodic interval so expired rows don't accumulate. Add to server startup (e.g., in `app.ts` or a dedicated `startScheduledJobs()` function):

  ```typescript
  import { cleanExpiredSessions } from './auth/sessionManager.js';

  // Clean expired sessions every 6 hours
  setInterval(() => {
    cleanExpiredSessions().catch((err) => logger.error('Session cleanup failed:', err));
  }, 6 * 60 * 60 * 1000);

  // Also run once at startup
  cleanExpiredSessions().catch((err) => logger.error('Initial session cleanup failed:', err));
  ```

- [ ] **2A.6** Create auth config with environment routing (`server/src/auth/authConfig.ts`)

  This is the "router" between strategies — reads `NODE_ENV` and exports the active strategy:

  ```typescript
  import { NODE_ENV } from '../constants/appConstants.js';
  import type { AuthStrategy } from './strategies/strategyTypes.js';
  import { MagicLinkStrategy } from './strategies/magicLinkStrategy.js';
  // import { PasswordStrategy } from './strategies/passwordStrategy.js';
  import { createLogger } from '../utils/logger.js';

  const logger = createLogger('AuthConfig');

  /**
   * PATTERN: Environment-based strategy selection.
   * Beta/development uses magic links (passwordless).
   * Production uses email + password.
   *
   * WHY: Build both strategy interfaces now, implement magic link now,
   * slot in password strategy later. The swap is this one function.
   */
  function createAuthStrategy(): AuthStrategy {
    const env = process.env.NODE_ENV ?? NODE_ENV.DEVELOPMENT;

    if (env === NODE_ENV.PRODUCTION) {
      // TODO: Uncomment when PasswordStrategy is implemented
      // return new PasswordStrategy();
      logger.warn('Password auth not yet implemented — falling back to magic link');
      return new MagicLinkStrategy();
    }

    logger.info(`Auth strategy: magic_link (env: ${env})`);
    return new MagicLinkStrategy();
  }

  export const authStrategy = createAuthStrategy();
  ```

- [ ] **2A.7** Fill in `requireAuth` middleware (`server/src/middlewares/security.ts`)

  Replace the existing no-op stub with real session validation:

  ```typescript
  import { validateSession } from '../auth/sessionManager.js';
  import type { SessionUser } from '../auth/sessionManager.js';

  // Extend Express Request to include user
  declare global {
    namespace Express {
      interface Request {
        user?: SessionUser;
      }
    }
  }

  export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token =
      req.cookies?.session_token ??
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    validateSession(token)
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'Session expired or invalid' });
          return;
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        logger.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
      });
  }
  ```

  Also add a role-checking middleware:

  ```typescript
  /**
   * Require specific user roles. Use after requireAuth.
   * Example: requireRole('agent', 'transaction_manager')
   */
  export function requireRole(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      if (!allowedRoles.includes(req.user.userRole)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      next();
    };
  }
  ```

#### Magic Link Strategy (Beta / Development)

- [ ] **2A.8** Create email service (`server/src/auth/emailService.ts`)

  Abstraction over email sending. Start with console logging for development, wire in Resend/SendGrid for hosted beta:

  ```typescript
  import { createLogger } from '../utils/logger.js';
  import { NODE_ENV } from '../constants/appConstants.js';

  const logger = createLogger('EmailService');

  export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
  }

  /**
   * Send an email. In development, logs to console instead of actually sending.
   * In production/beta, sends via configured provider (Resend, SendGrid, etc.).
   *
   * WHY: Lets us develop and test the full magic link flow locally
   * without needing an email provider account.
   */
  export async function sendEmail(payload: EmailPayload): Promise<void> {
    const env = process.env.NODE_ENV ?? NODE_ENV.DEVELOPMENT;

    if (env === NODE_ENV.DEVELOPMENT) {
      logger.info('──── DEV EMAIL (not actually sent) ────');
      logger.info(`To: ${payload.to}`);
      logger.info(`Subject: ${payload.subject}`);
      logger.info(`Body: ${payload.html}`);
      logger.info('───────────────────────────────────────');
      return;
    }

    // TODO: Wire in real email provider
    // Option 1: Resend (recommended — generous free tier, simple API)
    //   npm install resend
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: 'DHP Scheduler <noreply@yourdomain.com>',
    //     to: payload.to,
    //     subject: payload.subject,
    //     html: payload.html,
    //   });
    //
    // Option 2: SendGrid
    //   npm install @sendgrid/mail
    //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    //   await sgMail.send({ ... });

    logger.warn('Email provider not configured — email not sent');
  }
  ```

  **Email provider decision (make before beta launch):**

  | Provider | Free Tier | Complexity | Notes |
  |----------|-----------|------------|-------|
  | Resend | 3,000 emails/month | Very low | Modern API, TypeScript SDK, recommended |
  | SendGrid | 100 emails/day | Low | More established, Twilio-owned |
  | AWS SES | 62,000/month (from EC2) | Medium | Cheapest at scale, more setup |

- [ ] **2A.9** Create Magic Link strategy (`server/src/auth/strategies/magicLinkStrategy.ts`)

  ```typescript
  import { Router } from 'express';
  import crypto from 'node:crypto';
  import type { AuthStrategy, AuthClientConfig } from './strategyTypes.js';
  import { MagicLink } from '../../db/models/auth/MagicLink.js';
  import { User } from '../../db/models/participantModels/Users.js';
  import { createSession } from '../sessionManager.js';
  import { sendEmail } from '../emailService.js';
  import { createLogger } from '../../utils/logger.js';

  const logger = createLogger('MagicLinkStrategy');
  const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

  export class MagicLinkStrategy implements AuthStrategy {
    readonly name = 'magic_link' as const;

    getClientConfig(): AuthClientConfig {
      return { strategyName: 'magic_link', requiresPassword: false };
    }

    getRoutes(): Router {
      const router = Router();

      /**
       * POST /auth/magic-link
       * Body: { email: string, firstName?: string, lastName?: string }
       * Find-or-create user, generate magic link token, send email.
       */
      router.post('/magic-link', async (req, res) => {
        try {
          const { email, firstName, lastName } = req.body;
          if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
          }

          // Find existing user or create new one
          let user = await User.findOne({ where: { email } });
          if (!user && firstName && lastName) {
            user = await User.create({
              email,
              firstName,
              lastName,
              userRole: 'client', // default role for self-registration
            });
            logger.info(`New user created via magic link: ${email}`);
          } else if (!user) {
            // Don't reveal whether the email exists
            res.json({ message: 'If that email is registered, a login link has been sent.' });
            return;
          }

          // Generate token and save magic link
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);
          await MagicLink.create({ userId: user.id, token, expiresAt });

          // Build and send magic link email
          const baseUrl = process.env.CLIENT_URL ?? 'http://localhost:3002';
          const magicLinkUrl = `${baseUrl}/auth/verify?token=${token}`;

          await sendEmail({
            to: email,
            subject: 'Your DHP Scheduler Login Link',
            html: `
              <h2>Login to DHP Scheduler</h2>
              <p>Click the link below to log in. This link expires in 15 minutes.</p>
              <a href="${magicLinkUrl}">Log In to DHP Scheduler</a>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `,
          });

          res.json({ message: 'If that email is registered, a login link has been sent.' });
        } catch (error) {
          logger.error('Magic link request failed:', error);
          res.status(500).json({ error: 'Failed to process login request' });
        }
      });

      /**
       * POST /auth/verify
       * Body: { token: string }
       * Verify magic link token, create session, return session cookie.
       */
      router.post('/verify', async (req, res) => {
        try {
          const { token } = req.body;
          if (!token) {
            res.status(400).json({ error: 'Token is required' });
            return;
          }

          const magicLink = await MagicLink.findOne({
            where: { token, usedAt: null },
          });

          if (!magicLink || magicLink.expiresAt < new Date()) {
            res.status(401).json({ error: 'Invalid or expired link' });
            return;
          }

          // Mark token as used (one-time use)
          await magicLink.update({ usedAt: new Date() });

          // Create session
          const sessionToken = await createSession(magicLink.userId);

          // Set httpOnly cookie
          res.cookie('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          const user = await User.findByPk(magicLink.userId);
          res.json({
            user: user
              ? {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  userRole: user.userRole,
                }
              : null,
          });
        } catch (error) {
          logger.error('Magic link verification failed:', error);
          res.status(500).json({ error: 'Verification failed' });
        }
      });

      return router;
    }
  }
  ```

- [ ] **2A.10** Create auth router (`server/src/auth/authRouter.ts`)

  Mounts the active strategy's routes plus shared routes (`/me`, `/logout`, `/config`):

  ```typescript
  import { Router } from 'express';
  import { authStrategy } from './authConfig.js';
  import { validateSession, destroySession } from './sessionManager.js';
  import { requireAuth } from '../middlewares/security.js';

  const router = Router();

  // Shared: client calls this on startup to know which login form to render
  router.get('/config', (_req, res) => {
    res.json(authStrategy.getClientConfig());
  });

  // Shared: return current authenticated user
  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  // Shared: destroy session
  router.post('/logout', async (req, res) => {
    const token =
      req.cookies?.session_token ??
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await destroySession(token);
    }

    res.clearCookie('session_token');
    res.json({ message: 'Logged out' });
  });

  // Mount active strategy's routes (magic link or password)
  router.use('/', authStrategy.getRoutes());

  export { router as AuthRouter };
  ```

- [ ] **2A.11** Mount auth router in `server/src/routes/index.ts`

  Add `AuthRouter` alongside existing internal/external routers:

  ```typescript
  import { AuthRouter } from '../auth/authRouter.js';

  // Mount at /api/v1/auth — parallel to /api/v1/internal and /api/v1/external
  v1Router.use('/auth', AuthRouter);
  ```

  Also add `cookie-parser` middleware in `server/src/app.ts`:

  ```bash
  npm install cookie-parser
  npm install -D @types/cookie-parser
  ```

  ```typescript
  import cookieParser from 'cookie-parser';
  app.use(cookieParser());
  ```

- [ ] **2A.12** Add auth environment variables to `server/src/config/envConfig.ts`

  Add optional auth-related variables to the Joi schema and `EnvConfig` interface:

  ```typescript
  export interface EnvConfig {
    // ... existing fields ...
    CLIENT_URL: string;
    AUTH_STRATEGY: string;        // 'magic_link' | 'password' (override NODE_ENV default)
    RESEND_API_KEY: string | null; // for magic link emails
  }

  // In Joi schema:
  CLIENT_URL: Joi.string().default('http://localhost:3002'),
  AUTH_STRATEGY: Joi.string().valid('magic_link', 'password').optional(),
  RESEND_API_KEY: Joi.string().optional().allow('', null),
  ```

#### Client-Side Auth

- [ ] **2A.13** Create Pinia auth store (`client/src/stores/auth.ts`)

  ```typescript
  import { defineStore } from 'pinia';
  import { ref, computed } from 'vue';
  import apiClient from '@/utils/api';

  export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userRole: string;
  }

  export interface AuthConfig {
    strategyName: 'magic_link' | 'password';
    requiresPassword: boolean;
  }

  /**
   * PATTERN: Auth store manages current user state and auth strategy config.
   * WHY: Single source of truth for "who is logged in" across all components.
   * The store doesn't know which auth strategy is active — it just calls
   * the shared endpoints (/auth/me, /auth/logout, /auth/config).
   */
  export const useAuthStore = defineStore('auth', () => {
    const user = ref<AuthUser | null>(null);
    const authConfig = ref<AuthConfig | null>(null);
    const isLoading = ref(false);
    const isInitialized = ref(false);

    const isAuthenticated = computed(() => user.value !== null);
    const isAdmin = computed(() =>
      ['agent', 'transaction_manager'].includes(user.value?.userRole ?? '')
    );

    /** Fetch auth config (which strategy is active) */
    async function fetchAuthConfig(): Promise<AuthConfig> {
      const response = await apiClient.get<AuthConfig>('/api/v1/auth/config');
      authConfig.value = response.data;
      return response.data;
    }

    /** Check if user has an existing session (call on app startup) */
    async function fetchCurrentUser(): Promise<AuthUser | null> {
      try {
        isLoading.value = true;
        const response = await apiClient.get<{ user: AuthUser }>('/api/v1/auth/me');
        user.value = response.data.user;
        return response.data.user;
      } catch {
        user.value = null;
        return null;
      } finally {
        isLoading.value = false;
        isInitialized.value = true;
      }
    }

    /** Request a magic link (beta strategy) */
    async function requestMagicLink(
      email: string,
      firstName?: string,
      lastName?: string
    ): Promise<void> {
      await apiClient.post('/api/v1/auth/magic-link', {
        email, firstName, lastName,
      });
    }

    /** Verify a magic link token (called from MagicLinkVerifyView) */
    async function verifyMagicLink(token: string): Promise<AuthUser | null> {
      const response = await apiClient.post<{ user: AuthUser }>(
        '/api/v1/auth/verify',
        { token }
      );
      user.value = response.data.user;
      return response.data.user;
    }

    /** Log out */
    async function logout(): Promise<void> {
      await apiClient.post('/api/v1/auth/logout');
      user.value = null;
    }

    return {
      user,
      authConfig,
      isLoading,
      isInitialized,
      isAuthenticated,
      isAdmin,
      fetchAuthConfig,
      fetchCurrentUser,
      requestMagicLink,
      verifyMagicLink,
      logout,
    };
  });
  ```

- [ ] **2A.14** Create `AuthView.vue` — container that renders the correct form

  ```vue
  <template>
    <VContainer class="d-flex align-center justify-center" style="min-height: 80vh">
      <VCard max-width="480" width="100%" class="pa-6">
        <VCardTitle class="text-h5 text-center mb-4">
          DHP Scheduler
        </VCardTitle>

        <template v-if="!authConfig">
          <VSkeletonLoader type="card" />
        </template>

        <template v-else-if="authConfig.strategyName === 'magic_link'">
          <MagicLinkForm />
        </template>

        <template v-else-if="authConfig.strategyName === 'password'">
          <!-- PasswordLoginForm will go here when implemented -->
          <VAlert type="info">Password login coming soon.</VAlert>
        </template>
      </VCard>
    </VContainer>
  </template>

  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import MagicLinkForm from './MagicLinkForm.vue';

  const authStore = useAuthStore();
  const { authConfig } = storeToRefs(authStore);

  onMounted(() => {
    authStore.fetchAuthConfig();
  });
  </script>
  ```

- [ ] **2A.15** Create `MagicLinkForm.vue` — email input for beta

  ```vue
  <template>
    <div>
      <VCardSubtitle class="text-center mb-6">
        Enter your email to receive a login link
      </VCardSubtitle>

      <VForm @submit.prevent="handleSubmit">
        <VTextField
          v-model="email"
          label="Email"
          type="email"
          :rules="[rules.required, rules.email]"
          class="mb-2"
        />

        <!-- Show name fields for new users -->
        <template v-if="showNameFields">
          <VTextField
            v-model="firstName"
            label="First Name"
            :rules="[rules.required]"
            class="mb-2"
          />
          <VTextField
            v-model="lastName"
            label="Last Name"
            :rules="[rules.required]"
            class="mb-2"
          />
        </template>

        <VCheckbox
          v-model="showNameFields"
          label="I'm a new user"
          class="mb-4"
        />

        <VBtn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          Send Login Link
        </VBtn>
      </VForm>

      <VAlert
        v-if="successMessage"
        type="success"
        class="mt-4"
        variant="tonal"
      >
        {{ successMessage }}
      </VAlert>

      <VAlert
        v-if="errorMessage"
        type="error"
        class="mt-4"
        variant="tonal"
      >
        {{ errorMessage }}
      </VAlert>
    </div>
  </template>

  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();

  const email = ref('');
  const firstName = ref('');
  const lastName = ref('');
  const showNameFields = ref(false);
  const isSubmitting = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');

  const rules = {
    required: (value: string) => !!value || 'Required',
    email: (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email',
  };

  async function handleSubmit(): Promise<void> {
    try {
      isSubmitting.value = true;
      errorMessage.value = '';
      await authStore.requestMagicLink(
        email.value,
        showNameFields.value ? firstName.value : undefined,
        showNameFields.value ? lastName.value : undefined,
      );
      successMessage.value = 'Check your email for a login link!';
    } catch {
      errorMessage.value = 'Something went wrong. Please try again.';
    } finally {
      isSubmitting.value = false;
    }
  }
  </script>
  ```

- [ ] **2A.16** Create `MagicLinkVerifyView.vue` — landing page when user clicks the email link

  ```vue
  <template>
    <VContainer class="d-flex align-center justify-center" style="min-height: 80vh">
      <VCard max-width="480" width="100%" class="pa-6 text-center">
        <template v-if="isVerifying">
          <VProgressCircular indeterminate color="primary" class="mb-4" />
          <VCardTitle>Verifying your login...</VCardTitle>
        </template>

        <template v-else-if="error">
          <VIcon icon="mdi-alert-circle" color="error" size="64" class="mb-4" />
          <VCardTitle>Login Failed</VCardTitle>
          <VCardSubtitle>{{ error }}</VCardSubtitle>
          <VBtn to="/auth" color="primary" class="mt-4">Try Again</VBtn>
        </template>
      </VCard>
    </VContainer>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const isVerifying = ref(true);
  const error = ref('');

  onMounted(async () => {
    const token = route.query.token as string;
    if (!token) {
      error.value = 'No verification token provided.';
      isVerifying.value = false;
      return;
    }

    try {
      await authStore.verifyMagicLink(token);
      // Redirect to home (or wherever they were trying to go)
      const redirect = (route.query.redirect as string) ?? '/';
      router.replace(redirect);
    } catch {
      error.value = 'This link is invalid or has expired.';
    } finally {
      isVerifying.value = false;
    }
  });
  </script>
  ```

- [ ] **2A.17** Add auth routes to Vue Router (`client/src/router/index.ts`)

  Add auth routes and a navigation guard:

  ```typescript
  // New routes to add:
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/auth/AuthView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/verify',
    name: 'auth-verify',
    component: () => import('@/views/auth/MagicLinkVerifyView.vue'),
    meta: { requiresAuth: false },
  },

  // Navigation guard addition (inside router.beforeEach):
  //
  // On first load, check if user has a session:
  //   const authStore = useAuthStore()
  //   if (!authStore.isInitialized) {
  //     await authStore.fetchCurrentUser()
  //   }
  //
  // For routes that require auth (default: all except /auth and /auth/verify):
  //   const requiresAuth = to.meta.requiresAuth !== false
  //   if (requiresAuth && !authStore.isAuthenticated) {
  //     return { name: 'auth', query: { redirect: to.fullPath } }
  //   }
  //
  // For admin routes, also check role:
  //   if (to.path.startsWith('/admin') && !authStore.isAdmin) {
  //     return { name: 'home' }
  //   }
  ```

- [ ] **2A.18** Initialize auth on app startup (`client/src/main.ts` or `App.vue`)

  Call `fetchCurrentUser()` early so the session cookie is checked before any routing:

  ```typescript
  // In App.vue onMounted or in a router.beforeEach guard:
  const authStore = useAuthStore();
  await authStore.fetchCurrentUser();
  ```

#### Password Strategy (Production — Implement Later)

- [ ] **2A.19** Create `login` table migration (when ready for production)

  ```sql
  -- This migration is NOT needed for beta. Build when transitioning to production.
  CREATE TABLE public.login (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  ```

  This is the table that `users.login_id` already references. When built, update the FK constraint.

- [ ] **2A.20** Create Password strategy (`server/src/auth/strategies/passwordStrategy.ts`)

  Skeleton — implement when transitioning to production:

  ```typescript
  import { Router } from 'express';
  import type { AuthStrategy, AuthClientConfig } from './strategyTypes.js';
  // import bcrypt from 'bcrypt';

  export class PasswordStrategy implements AuthStrategy {
    readonly name = 'password' as const;

    getClientConfig(): AuthClientConfig {
      return { strategyName: 'password', requiresPassword: true };
    }

    getRoutes(): Router {
      const router = Router();

      // POST /auth/register — create account with email + password
      // router.post('/register', async (req, res) => { ... });

      // POST /auth/login — verify email + password
      // router.post('/login', async (req, res) => { ... });

      // POST /auth/forgot-password — send password reset email
      // router.post('/forgot-password', async (req, res) => { ... });

      // POST /auth/reset-password — set new password from reset token
      // router.post('/reset-password', async (req, res) => { ... });

      return router;
    }
  }
  ```

- [ ] **2A.21** Create `PasswordLoginForm.vue` (implement when transitioning to production)

  Skeleton — the `AuthView.vue` container already has the conditional to render this component.

- [ ] **2A.22** Flip the strategy in `authConfig.ts` (production transition)

  When the password strategy is implemented, uncomment the line in `authConfig.ts`:

  ```typescript
  if (env === NODE_ENV.PRODUCTION) {
    return new PasswordStrategy(); // ← uncomment this line
  }
  ```

  Or use the `AUTH_STRATEGY` environment variable override for more granular control.

### Dependencies to Install

```bash
# Server
npm install cookie-parser        # Parse session cookies
npm install --save-dev @types/cookie-parser

# Server (when ready for email sending)
npm install resend               # Email provider for magic links (or @sendgrid/mail)

# Server (when ready for password strategy)
npm install bcrypt               # Password hashing
npm install --save-dev @types/bcrypt
```

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth pattern | Strategy Pattern | Swap between magic link (beta) and password (prod) via `NODE_ENV` without changing middleware, stores, or API contracts |
| Session storage | PostgreSQL (sessions table) | Simple, revocable, no signing infrastructure. Upgrade to JWT later if needed — API contract stays the same |
| Session token delivery | httpOnly cookie | Secure by default (not accessible to JS), automatic on every request, no client-side token management |
| Beta strategy | Magic Link | No passwords, low friction, proves email ownership, collects user data |
| Production strategy | Email + Password | Standard auth, deferred until beta validates the product |
| Email provider | Resend (recommended) | Generous free tier (3K/month), modern TypeScript API, simple setup |
| Dev email behavior | Console logging | Full flow testable locally without email provider account |
| Token format | 32-byte random hex | Cryptographically secure, no JWT overhead, no signing keys to manage |

### What This Gives You for Beta

1. **Email collection** — every user gives their email to get a magic link
2. **User tracking** — sessions tie feedback, appointments, and behavior to specific users
3. **Role-based access** — admin panel restricted to `agent` / `transaction_manager` roles
4. **Auto-populate** — returning users recognized by session; forms pre-fill their info
5. **Rescheduling access** — users see "their" appointments because `req.user` is set
6. **Zero-rework upgrade path** — password strategy slots into the same architecture

---

## Phase 3: Test Suite Setup (New Feature — Document in Project Manager)

**Goal:** Establish a comprehensive, layered testing strategy. This should be documented as a new feature in `.project-manager/features/test-suite-setup/`.

### Architecture

```
Testing Pyramid + Quality Validation
──────────────────────────────────────────
           E2E Tests (Playwright)
          Browser-level user flows
──────────────────────────────────────────
       Integration Tests (Vitest/Jest)
      API routes, DB queries, composables
──────────────────────────────────────────
          Unit Tests (Vitest/Jest)
     Pure functions, transformers, utils
──────────────────────────────────────────
    ┌─ Test Quality Validation (Phase 3A) ──┐
    │  Mutation Testing (Stryker)            │
    │  Property-Based Testing (fast-check)   │
    │  Behavioral Alignment Audit            │
    └───────────────────────────────────────┘
──────────────────────────────────────────
      Static Analysis (TypeScript, ESLint)
        Type checking, linting rules
──────────────────────────────────────────
```

See **Phase 3A** for full details on test quality validation (mutation testing, property-based testing, behavioral alignment audit).

### Checklist

- [ ] **3.0** Re-enable test file linting and type-checking (PREREQUISITE — do this first)
  - Remove test file exclusions from `client/tsconfig.json` (`src/**/__tests__/**`, `src/**/*.test.ts`, etc.)
  - Remove test file exclusions from `server/tsconfig.json` (`src/**/__tests__/**`, `src/**/*.test.ts`, etc.)
  - Remove test file ignores from `client/eslint.config.js` (the `__tests__` and `*.test.*` patterns in the `ignores` block)
  - Remove test file ignores from `server/eslint.config.js` (same patterns)
  - Fix all TypeScript errors in test files (~1,326 errors, mostly outdated type shapes in test data/factories)
  - Re-enable test-related Cursor rules: restore `alwaysApply: true` in `testing-size.mdc`, `testing-headers.mdc`, `immutable-tests.mdc`, `test-script.mdc`
  - Verify: `cd client && npx tsc --noEmit` passes with zero errors including test files
  - Verify: `cd client && npm run lint` passes with test files included
  - Verify: `cd server && npm run lint` passes with test files included
- [ ] **3.0a** Turn test audits back on before starting the testing build
  - Set `testsDisabled` to `false` (or equivalent) in `client/.audit-reports/audit-global-config.json` so that test-related audits (audit:test, coverage-risk-crossref) run and contribute to the meta report
  - If audit:all or coverage-risk-crossref was changed to skip these when tests are disabled, remove or reverse that conditional so they run again
  - Re-run `audit:meta` to confirm coverage-risk and test-audit outputs appear in the dashboard
  - See Plan D in the fix_constants_types_component_audits plan (`.cursor/plans/` or audit script docs) for central config details
- [ ] **3.1** Create feature documentation in `.project-manager/features/test-suite-setup/`
  - `README.md` — Feature overview
  - `feature-{feature-name}-guide.md` — Detailed plan with phases/sessions
  - Register in `PROJECT_PLAN.md` and `MASTER_FEATURE_INDEX.md`
- [ ] **3.2** Audit existing test coverage
  - Run `npx vitest --coverage` in client to generate coverage report
  - Run `npx jest --coverage` in server to generate coverage report
  - Identify critical paths with low/no coverage
- [ ] **3.3** Define coverage targets for launch
  - Client: Maintain existing thresholds (80% branches, 90% functions/lines/statements)
  - Server: Match client thresholds (currently no enforced thresholds beyond jest.config.js)
  - E2E: Cover all critical user paths (booking flow, admin CRUD)
- [ ] **3.4** Set up Playwright for E2E testing
  - Install Playwright: `npm init playwright@latest` in a `tests/` or `e2e/` directory
  - Configure for your app's URLs (dev and staging)
  - Create base test fixtures (authenticated admin, unauthenticated user)
- [ ] **3.5** Write E2E tests for critical booking flow
  - Test: Navigate to booking wizard → Select user type → Select service → Select availability → Confirm
  - Test: Error states (API down, no availability)
  - Test: Responsive behavior (mobile viewport)
- [ ] **3.6** Write E2E tests for admin panel
  - Test: Navigate to admin → CRUD operations on shapes/instances
  - Test: Relationship management
  - Test: Business controls configuration
- [ ] **3.7** Expand server integration tests
  - Test: Full request lifecycle for each route (request → middleware → handler → DB → response)
  - Test: Google Calendar integration with mocked API responses
  - Test: Availability calculation end-to-end
  - Test: Error handling paths (400, 404, 500 responses)
- [ ] **3.8** Add E2E testing job to GitHub Actions CI
  - Add Playwright job to `.github/workflows/ci.yml`
  - Run against a test environment (or use Playwright's built-in server)
  - Upload test artifacts (screenshots, traces) on failure
- [ ] **3.9** Add test coverage reporting to CI
  - Generate coverage reports in CI
  - Consider GitHub Action to post coverage summary on PRs
  - Set up coverage badge in README (optional)
- [ ] **3.10** Set up pre-commit hooks (optional but recommended)
  - Install husky + lint-staged
  - Run linting and type checking on staged files before commit
  - Prevents broken code from being committed

---

## Phase 3A: Test Quality Validation

**Goal:** Ensure that tests verify **desired behavior**, not just that code runs without crashing. Traditional code coverage answers "was this line executed?" — test quality validation answers "would my tests catch a real bug?"

**Why This Matters:** A codebase can have 100% code coverage but a 30% mutation score — meaning tests touched every line but didn't actually check whether those lines produced correct results. This phase adds three layers of test quality assurance: mutation testing (automated bug detection), property-based testing (invariant verification with random inputs), and a manual behavioral alignment audit.

### Architecture

```
Test Quality Layers (new — supplements existing testing pyramid)
──────────────────────────────────────────────────────────────────

  LAYER 1: Mutation Testing (Stryker Mutator)
  Automatically introduces small bugs ("mutants") into source code
  and verifies that tests catch them. Measures "mutation score" —
  the percentage of bugs your tests would detect.

  LAYER 2: Property-Based Testing (fast-check)
  Generates hundreds of random inputs and verifies that invariants
  (properties that must always be true) hold. Finds edge cases
  you'd never think of manually.

  LAYER 3: Behavioral Alignment Audit (manual + scripted)
  Deterministic checklist applied to each test file to verify
  tests describe behavior, not just structure.

Relationship to existing layers:
  Static Analysis (TypeScript, ESLint)      → "Does it compile?"
  Unit Tests (Vitest)                       → "Does it run?"
  Test Quality Validation (THIS PHASE)      → "Does it catch bugs?"
  Integration Tests                         → "Do parts work together?"
  E2E Tests (Playwright)                    → "Does the user flow work?"
```

### Checklist

#### Layer 1: Mutation Testing with Stryker Mutator

Stryker works by: (1) parsing your source code, (2) creating "mutants" — copies with one small deliberate change each (e.g., `===` to `!==`, `true` to `false`, removing a function call), (3) running your test suite against each mutant, (4) reporting which mutants "survived" (tests didn't catch the bug) vs were "killed" (tests failed, catching the bug).

- [ ] **3A.1** Install Stryker Mutator with Vitest plugin

  Run from `client/` directory:

  ```bash
  npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
  ```

  Packages explained:
  - `@stryker-mutator/core` — The mutation testing engine
  - `@stryker-mutator/vitest-runner` — Tells Stryker to use Vitest (not Jest) to run tests
  - `@stryker-mutator/typescript-checker` — Filters out mutants that would cause TypeScript compilation errors (so you only test meaningful mutations)

- [ ] **3A.2** Create Stryker configuration file (`client/stryker.config.mjs`)

  ```javascript
  /** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
  const config = {
    // Tell Stryker to use Vitest to run tests
    testRunner: 'vitest',

    // Use TypeScript checker to filter out invalid mutants
    checkers: ['typescript'],
    tsconfigFile: 'tsconfig.json',

    // Which source files to mutate (NOT test files — your actual source code)
    mutate: [
      'src/composables/booking/**/*.ts',
      'src/composables/useBookingWizard.ts',
      'src/utils/transformers/**/*.ts',
      'src/utils/booking/**/*.ts',
      '!src/**/__tests__/**',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts',
      '!src/**/mocks/**',
      '!src/**/factories/**',
    ],

    // Types of mutations to apply
    // (default set is good — includes arithmetic, boolean, conditional, string, array mutations)

    // Reporter configuration
    reporters: ['html', 'clear-text', 'progress'],
    htmlReporter: {
      fileName: '.mutation-reports/mutation-report.html',
    },

    // Thresholds — start conservative, increase as you fix surviving mutants
    thresholds: {
      high: 80,   // Green: 80%+ mutation score
      low: 60,    // Yellow: 60-79%
      break: 50,  // Red/fail: below 50% (CI will fail)
    },

    // Performance: Stryker runs your full test suite once per mutant.
    // These settings help manage runtime on larger codebases.
    concurrency: 2,       // Run 2 mutants in parallel
    timeoutMS: 30000,     // Kill a test run if it takes > 30 seconds
    timeoutFactor: 1.5,   // Allow 1.5x the normal test runtime before timing out
  }
  export default config
  ```

- [ ] **3A.3** Add Stryker npm scripts to `client/package.json`

  ```json
  {
    "scripts": {
      "test:mutate": "stryker run",
      "test:mutate:booking": "stryker run --mutate 'src/composables/booking/**/*.ts'",
      "test:mutate:transformers": "stryker run --mutate 'src/utils/transformers/**/*.ts'",
      "test:mutate:utils": "stryker run --mutate 'src/utils/booking/**/*.ts'"
    }
  }
  ```

  Scripts explained:
  - `test:mutate` — Full mutation test run against all configured source files
  - `test:mutate:booking` — Scoped run against booking composables only (faster for iterating)
  - `test:mutate:transformers` — Scoped run against transformer utilities
  - `test:mutate:utils` — Scoped run against booking utility functions

- [ ] **3A.4** Run initial Stryker mutation test on transformer primitives (quick win)

  This is the best starting point because transformer primitives are pure functions with comprehensive existing tests. Run:

  ```bash
  cd client
  npx stryker run --mutate 'src/utils/transformers/transformerPrimitives.ts'
  ```

  **What to look for in the report:**
  - **Killed mutants** (green): Your test caught the bug. These are the tests working correctly.
  - **Survived mutants** (red): Your test did NOT catch the bug. These need new or better assertions.
  - **No coverage** (grey): No test covers this code path at all.
  - **Timeout** (yellow): The mutation caused an infinite loop. Usually fine — means code is "covered."

  **Example of a surviving mutant and how to fix it:**

  If Stryker mutates `safeString` from:
  ```typescript
  if (typeof value === 'string') return value
  ```
  to:
  ```typescript
  if (typeof value !== 'string') return value
  ```
  ...and the test still passes, it means no test is verifying that a valid string input actually returns that same string. You'd add:
  ```typescript
  it('returns the exact input string, not a fallback', () => {
    const input = 'specific-value'
    const result = safeString(input)
    expect(result).toBe('specific-value')
    expect(result).not.toBe('')  // negative assertion: proves it's not the fallback
  })
  ```

- [ ] **3A.5** Run Stryker on booking composables (critical business logic)

  ```bash
  cd client
  npm run test:mutate:booking
  ```

  Priority composables to analyze (highest business impact):
  - `src/composables/booking/useWizardFilteredOptions.ts` — Service/option cascade filtering
  - `src/composables/booking/useTimeSlotCalculations.ts` — Time and availability math
  - `src/composables/booking/useStepValidation.ts` — Booking wizard validation rules
  - `src/composables/booking/useComputedAvailability.ts` — Availability computation

  **After running:** Open the HTML report at `.mutation-reports/mutation-report.html` in a browser. It shows every mutant, whether it survived or was killed, and which file/line it was on.

- [ ] **3A.6** Fix surviving mutants by strengthening test assertions

  For each surviving mutant in the report:
  1. Read the mutation (what was changed in the source code)
  2. Understand what behavior the mutation would break
  3. Add or strengthen a test assertion that catches that specific mutation
  4. Re-run Stryker on that file to confirm the mutant is now killed

  Do NOT modify source code to make mutants die — fix the TESTS instead.

- [ ] **3A.7** Define mutation score targets

  | Category | Initial Target | Stretch Target | Notes |
  |----------|---------------|----------------|-------|
  | Transformer primitives | 90% | 95% | Pure functions, easy to test fully |
  | Booking composables | 70% | 80% | Complex reactive logic, some hard-to-test paths |
  | Booking utilities | 80% | 90% | Fee calculations, duration rounding |
  | Overall (all mutated files) | 70% | 80% | Weighted average across all categories |

- [ ] **3A.8** Add `.mutation-reports/` to `.gitignore`

  Stryker HTML reports are local artifacts (like coverage reports). Add to `client/.gitignore`:

  ```
  # Mutation testing reports
  .mutation-reports/
  ```

#### Layer 2: Property-Based Testing with fast-check

Property-based testing generates hundreds of random inputs and verifies that certain **invariants** (properties that must always hold true) are maintained. Instead of testing "given this specific input, I expect this specific output," you test "for ANY input, this property must hold."

- [ ] **3A.9** Install fast-check

  ```bash
  cd client
  npm install --save-dev fast-check
  ```

  fast-check integrates directly with Vitest — no additional plugins needed. You import it and use it inside regular `it()` blocks.

- [ ] **3A.10** Write property-based tests for transformer primitives

  Create `client/src/utils/transformers/__tests__/transformerPrimitives.property.test.ts`:

  ```typescript
  /**
   * Property-based tests for transformerPrimitives.
   * Covers: Invariant verification across random inputs for safe extraction functions.
   * Validates: Return type guarantees, idempotency, fallback behavior for arbitrary input.
   * Dependencies: vitest, fast-check.
   *
   * WHY: Example-based tests verify specific cases (null, undefined, 42).
   * Property-based tests verify that invariants hold for ALL possible inputs,
   * including edge cases you'd never think of (empty strings, MAX_SAFE_INTEGER,
   * special Unicode, nested arrays, etc.).
   */

  import { describe, it, expect } from 'vitest'
  import fc from 'fast-check'
  import {
    safeString,
    safeNumber,
    safeBoolean,
    safeArray,
    safeId,
    normalizePrimitiveForSave,
  } from '../transformerPrimitives'

  describe('transformerPrimitives (property-based)', () => {

    describe('safeString', () => {
      it('always returns a string regardless of input type', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const result = safeString(arbitraryInput)
              expect(typeof result).toBe('string')
            }
          )
        )
      })

      it('is idempotent: safeString(safeString(x)) === safeString(x)', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const once = safeString(arbitraryInput)
              const twice = safeString(once)
              expect(twice).toBe(once)
            }
          )
        )
      })

      it('preserves all valid strings exactly as-is', () => {
        fc.assert(
          fc.property(
            fc.string(),
            (validString) => {
              expect(safeString(validString)).toBe(validString)
            }
          )
        )
      })

      it('returns empty string for all non-string inputs', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.integer(),
              fc.double(),
              fc.boolean(),
              fc.constant(null),
              fc.constant(undefined),
              fc.object()
            ),
            (nonStringInput) => {
              expect(safeString(nonStringInput)).toBe('')
            }
          )
        )
      })
    })

    describe('safeNumber', () => {
      it('always returns a finite number regardless of input type', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const result = safeNumber(arbitraryInput)
              expect(typeof result).toBe('number')
              expect(Number.isFinite(result)).toBe(true)
            }
          )
        )
      })

      it('preserves all finite numbers exactly as-is', () => {
        fc.assert(
          fc.property(
            fc.double({ noNaN: true, noDefaultInfinity: true }),
            (finiteNumber) => {
              expect(safeNumber(finiteNumber)).toBe(finiteNumber)
            }
          )
        )
      })

      it('rejects Infinity and NaN', () => {
        expect(safeNumber(Infinity)).toBe(0)
        expect(safeNumber(-Infinity)).toBe(0)
        expect(safeNumber(NaN)).toBe(0)
      })
    })

    describe('safeBoolean', () => {
      it('always returns a boolean regardless of input type', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const result = safeBoolean(arbitraryInput)
              expect(typeof result).toBe('boolean')
            }
          )
        )
      })

      it('preserves true and false exactly', () => {
        expect(safeBoolean(true)).toBe(true)
        expect(safeBoolean(false)).toBe(false)
      })
    })

    describe('safeArray', () => {
      it('always returns an array regardless of input', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.array(fc.anything()),
              fc.constant(null),
              fc.constant(undefined)
            ),
            (input) => {
              const result = safeArray(input)
              expect(Array.isArray(result)).toBe(true)
            }
          )
        )
      })

      it('returns a new array (not the same reference) for array inputs', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string()),
            (inputArray) => {
              const result = safeArray(inputArray)
              expect(result).not.toBe(inputArray)
              expect(result).toEqual(inputArray)
            }
          )
        )
      })

      it('preserves array length for valid array inputs', () => {
        fc.assert(
          fc.property(
            fc.array(fc.anything()),
            (inputArray) => {
              expect(safeArray(inputArray)).toHaveLength(inputArray.length)
            }
          )
        )
      })
    })

    describe('safeId', () => {
      it('returns string or null for any input', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const result = safeId(arbitraryInput)
              expect(result === null || typeof result === 'string').toBe(true)
            }
          )
        )
      })

      it('returns null for empty and whitespace-only strings', () => {
        fc.assert(
          fc.property(
            fc.stringOf(fc.constant(' ')),
            (whitespaceString) => {
              expect(safeId(whitespaceString)).toBeNull()
            }
          )
        )
      })

      it('trims valid string IDs', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            (validId) => {
              const result = safeId(validId)
              expect(result).toBe(validId.trim())
            }
          )
        )
      })
    })

    describe('normalizePrimitiveForSave', () => {
      it('never returns null (converts to undefined)', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            (arbitraryInput) => {
              const result = normalizePrimitiveForSave(arbitraryInput)
              expect(result).not.toBeNull()
            }
          )
        )
      })

      it('preserves booleans exactly', () => {
        expect(normalizePrimitiveForSave(true)).toBe(true)
        expect(normalizePrimitiveForSave(false)).toBe(false)
      })

      it('trims strings (no leading/trailing whitespace in result)', () => {
        fc.assert(
          fc.property(
            fc.string().filter(s => s.trim().length > 0),
            (inputString) => {
              const result = normalizePrimitiveForSave(inputString)
              if (typeof result === 'string') {
                expect(result).toBe(result.trim())
              }
            }
          )
        )
      })
    })
  })
  ```

- [ ] **3A.11** Write property-based tests for booking utility functions

  Create `client/src/utils/booking/__tests__/bookingUtils.property.test.ts` for fee calculation and duration rounding invariants. Key properties to test:

  ```typescript
  /**
   * Property-based tests for booking utility functions.
   * Covers: Invariant verification for fee calculations and duration rounding.
   * Validates: Non-negative fees, rounding consistency, associativity of fee accumulation.
   * Dependencies: vitest, fast-check.
   */

  import { describe, it, expect } from 'vitest'
  import fc from 'fast-check'

  describe('booking calculation invariants (property-based)', () => {

    describe('fee calculations', () => {
      it('total fee should never be negative', () => {
        fc.assert(
          fc.property(
            fc.array(fc.double({ min: 0, max: 10000, noNaN: true })),
            (partFees) => {
              const total = partFees.reduce((sum, fee) => sum + fee, 0)
              expect(total).toBeGreaterThanOrEqual(0)
            }
          )
        )
      })

      it('fee with zero quantity should be zero', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 1000, noNaN: true }),
            (unitPrice) => {
              const fee = unitPrice * 0
              expect(fee).toBe(0)
            }
          )
        )
      })
    })

    describe('duration rounding', () => {
      it('rounded duration should always be >= original duration', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 480, noNaN: true }),
            fc.integer({ min: 1, max: 60 }),
            (durationMinutes, roundingInterval) => {
              const rounded = Math.ceil(durationMinutes / roundingInterval) * roundingInterval
              expect(rounded).toBeGreaterThanOrEqual(durationMinutes)
            }
          )
        )
      })

      it('rounded duration should be a multiple of the rounding interval', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 480, noNaN: true }),
            fc.integer({ min: 1, max: 60 }),
            (durationMinutes, roundingInterval) => {
              const rounded = Math.ceil(durationMinutes / roundingInterval) * roundingInterval
              expect(rounded % roundingInterval).toBe(0)
            }
          )
        )
      })
    })
  })
  ```

  Adapt the import paths and function calls to match your actual fee calculation and duration rounding functions once you identify them.

#### Layer 3: Behavioral Alignment Audit

A deterministic checklist applied to each test file to verify it tests **behavior**, not just **structure**. This can be done manually during code review, or scripted as an audit.

- [ ] **3A.12** Create the test alignment audit script (`client/.scripts/test-alignment-audit.mjs`)

  This follows your existing audit script pattern and produces a JSON + markdown report:

  ```javascript
  /**
   * Test Alignment Audit
   *
   * Evaluates test files against a behavioral alignment checklist:
   * 1. Does the test name describe a behavior (not implementation detail)?
   * 2. Does the test include an action (not just structural checks)?
   * 3. Does the test include negative assertions (.not.)?
   * 4. Does the test verify preconditions (initial state before action)?
   * 5. Does the test have specific value assertions (not just .toBeInstanceOf)?
   *
   * Outputs:
   * - .audit-reports/test-alignment-audit.json (machine-readable)
   * - .audit-reports/test-alignment-audit-summary.md (human-readable)
   */

  import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
  import { join, relative } from 'path'

  const SRC_DIR = join(process.cwd(), 'src')
  const REPORT_DIR = join(process.cwd(), '.audit-reports')

  function findTestFiles(dir) {
    const results = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...findTestFiles(fullPath))
      } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts')) {
        results.push(fullPath)
      }
    }
    return results
  }

  function analyzeTestFile(filePath) {
    const content = readFileSync(filePath, 'utf-8')
    const relativePath = relative(process.cwd(), filePath)
    const lines = content.split('\n')

    const itBlocks = []
    const itRegex = /it\(['"`](.*?)['"`]/g
    let match
    while ((match = itRegex.exec(content)) !== null) {
      itBlocks.push(match[1])
    }

    const hasNegativeAssertions = /expect\(.*\)\.not\./.test(content)
    const hasSpecificValues = /\.toBe\((?!true\)|false\))/.test(content) || /\.toEqual\(/.test(content)
    const hasStructureOnlyChecks = /\.toBeInstanceOf\(Array\)/.test(content) && !hasSpecificValues
    const hasDescriptiveHeader = /\/\*\*[\s\S]*?\*\//.test(content.slice(0, 500))

    const behavioralNames = itBlocks.filter(name =>
      /should .+ when|returns .+ for|filters .+ by|rejects|preserves|clears|throws|prevents/i.test(name)
    )
    const structuralNames = itBlocks.filter(name =>
      /should have .+ property|should be .+ instance|should exist/i.test(name)
    )

    const hasPreconditions = /expect\(.*\)\.(toBe|toEqual|toHaveLength)\(.*\)[\s\S]*?(\.toggle|\.set|\.select|\.click|\.submit|\.push|\.add)/
      .test(content)

    const score = {
      behavioralNaming: itBlocks.length > 0
        ? Math.round((behavioralNames.length / itBlocks.length) * 100)
        : 0,
      hasNegativeAssertions,
      hasSpecificValues,
      hasStructureOnlyChecks,
      hasDescriptiveHeader,
      hasPreconditions,
      totalTests: itBlocks.length,
      behavioralTests: behavioralNames.length,
      structuralTests: structuralNames.length,
    }

    const alignmentScore = [
      score.behavioralNaming >= 50 ? 1 : 0,
      score.hasNegativeAssertions ? 1 : 0,
      score.hasSpecificValues ? 1 : 0,
      !score.hasStructureOnlyChecks ? 1 : 0,
      score.hasDescriptiveHeader ? 1 : 0,
      score.hasPreconditions ? 1 : 0,
    ].reduce((sum, v) => sum + v, 0)

    return {
      file: relativePath,
      ...score,
      alignmentScore,
      maxScore: 6,
      grade: alignmentScore >= 5 ? 'A' : alignmentScore >= 4 ? 'B' : alignmentScore >= 3 ? 'C' : 'D',
    }
  }

  const testFiles = findTestFiles(SRC_DIR)
  const results = testFiles.map(analyzeTestFile)

  const summary = {
    totalFiles: results.length,
    totalTests: results.reduce((sum, r) => sum + r.totalTests, 0),
    averageAlignmentScore: (results.reduce((sum, r) => sum + r.alignmentScore, 0) / results.length).toFixed(1),
    gradeDistribution: {
      A: results.filter(r => r.grade === 'A').length,
      B: results.filter(r => r.grade === 'B').length,
      C: results.filter(r => r.grade === 'C').length,
      D: results.filter(r => r.grade === 'D').length,
    },
    filesNeedingWork: results.filter(r => r.grade === 'D').map(r => r.file),
  }

  writeFileSync(
    join(REPORT_DIR, 'test-alignment-audit.json'),
    JSON.stringify({ summary, results }, null, 2)
  )

  let md = `# Test Alignment Audit\n\n`
  md += `**Generated:** ${new Date().toISOString()}\n\n`
  md += `## Summary\n\n`
  md += `| Metric | Value |\n|--------|-------|\n`
  md += `| Total test files | ${summary.totalFiles} |\n`
  md += `| Total test cases | ${summary.totalTests} |\n`
  md += `| Average alignment score | ${summary.averageAlignmentScore} / 6 |\n`
  md += `| Grade A (5-6/6) | ${summary.gradeDistribution.A} files |\n`
  md += `| Grade B (4/6) | ${summary.gradeDistribution.B} files |\n`
  md += `| Grade C (3/6) | ${summary.gradeDistribution.C} files |\n`
  md += `| Grade D (0-2/6) | ${summary.gradeDistribution.D} files |\n\n`

  if (summary.filesNeedingWork.length > 0) {
    md += `## Files Needing Work (Grade D)\n\n`
    summary.filesNeedingWork.forEach(f => { md += `- \`${f}\`\n` })
    md += '\n'
  }

  md += `## Scoring Criteria\n\n`
  md += `Each test file is scored on 6 criteria (1 point each):\n\n`
  md += `| # | Criterion | What it checks |\n`
  md += `|---|-----------|----------------|\n`
  md += `| 1 | Behavioral naming | ≥50% of test names describe behavior (should...when, returns...for) |\n`
  md += `| 2 | Negative assertions | File includes at least one .not. assertion |\n`
  md += `| 3 | Specific value checks | Tests use .toBe(specificValue) or .toEqual(), not just .toBeInstanceOf() |\n`
  md += `| 4 | No structure-only tests | File doesn't rely solely on type/instance checks |\n`
  md += `| 5 | Descriptive header | File begins with a JSDoc header explaining coverage |\n`
  md += `| 6 | Preconditions | Tests verify starting state before performing actions |\n\n`

  md += `## All Files\n\n`
  md += `| File | Tests | Alignment | Grade |\n`
  md += `|------|-------|-----------|-------|\n`
  results
    .sort((a, b) => a.alignmentScore - b.alignmentScore)
    .forEach(r => {
      md += `| \`${r.file}\` | ${r.totalTests} | ${r.alignmentScore}/${r.maxScore} | ${r.grade} |\n`
    })

  writeFileSync(join(REPORT_DIR, 'test-alignment-audit-summary.md'), md)
  console.log(`Test alignment audit complete: ${results.length} files analyzed.`)
  console.log(`Average alignment score: ${summary.averageAlignmentScore}/6`)
  console.log(`Report: .audit-reports/test-alignment-audit-summary.md`)
  ```

- [ ] **3A.13** Add audit scripts to `client/package.json`

  ```json
  {
    "scripts": {
      "audit:test-alignment": "node .scripts/test-alignment-audit.mjs",
      "audit:test-alignment:summary": "node .scripts/test-alignment-audit-summary.mjs"
    }
  }
  ```

  Also register in the `audit:all` pipeline so it runs alongside other audits.

- [ ] **3A.14** Run the behavioral alignment audit and review results

  ```bash
  cd client
  npm run audit:test-alignment
  ```

  Review the Grade D files first — these are tests most likely to be "passing without verifying behavior." For each:
  1. Open the test file
  2. Apply the 6-point checklist manually
  3. Strengthen assertions, add negative checks, rename tests to describe behavior
  4. Re-run the audit to confirm grade improvement

- [ ] **3A.15** Strengthen Grade D and C test files identified by the audit

  Common fixes, with before/after examples:

  **Fix 1: Structure-only test → Behavioral test**
  ```typescript
  // BEFORE (structure-only — passes even if logic is broken)
  it('should have available services computed property', () => {
    const wizard = useBookingWizard()
    expect(wizard.availableServices.value).toBeInstanceOf(Array)
  })

  // AFTER (behavioral — fails if filtering logic breaks)
  it('should return only active services matching selected user type', () => {
    const wizard = useBookingWizard()
    // Precondition: starts empty before selection
    expect(wizard.availableServices.value).toHaveLength(0)

    // Action: select a user type that cascades to specific services
    wizard.selectUserType(mockUserType)

    // Postcondition: filtered results match expectations
    expect(wizard.availableServices.value).toHaveLength(2)
    expect(wizard.availableServices.value.map(s => s.id)).toContain('service-1')
    expect(wizard.availableServices.value.map(s => s.id)).not.toContain('service-3')
  })
  ```

  **Fix 2: Missing negative assertion**
  ```typescript
  // BEFORE (only checks positive case)
  it('should filter services by user type', () => {
    expect(filtered).toHaveLength(2)
    expect(filtered.map(s => s.id)).toContain('service-1')
    expect(filtered.map(s => s.id)).toContain('service-2')
  })

  // AFTER (adds negative assertion proving exclusion works)
  it('should filter services by user type', () => {
    expect(filtered).toHaveLength(2)
    expect(filtered.map(s => s.id)).toContain('service-1')
    expect(filtered.map(s => s.id)).toContain('service-2')
    expect(filtered.map(s => s.id)).not.toContain('service-3')  // proves filter excludes
  })
  ```

  **Fix 3: Missing precondition**
  ```typescript
  // BEFORE (no precondition — unclear what the starting state was)
  it('should toggle selection on', () => {
    wizard.toggleServiceTypeBlock(mockService)
    expect(wizard.selectedServiceTypeBlocks.value).toHaveLength(1)
  })

  // AFTER (precondition establishes starting state)
  it('should toggle selection on from empty state', () => {
    expect(wizard.selectedServiceTypeBlocks.value).toHaveLength(0)  // precondition
    wizard.toggleServiceTypeBlock(mockService)
    expect(wizard.selectedServiceTypeBlocks.value).toHaveLength(1)  // postcondition
  })
  ```

#### Layer Integration: Combining All Three Layers

- [ ] **3A.16** Add mutation testing to CI pipeline (GitHub Actions)

  Add to `.github/workflows/ci.yml` as an optional quality gate (not blocking initially):

  ```yaml
  mutation-test:
    name: Mutation Testing (Quality Gate)
    runs-on: ubuntu-latest
    needs: [test-client]  # Only run after unit tests pass
    if: github.event_name == 'pull_request'  # Only on PRs, not every push
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: client/package-lock.json
      - run: npm ci
        working-directory: client
      - run: npx stryker run
        working-directory: client
      - name: Upload mutation report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: client/.mutation-reports/
          retention-days: 14
  ```

  Start with this as a **non-blocking** job (no `required` status check). Once mutation scores stabilize above the `break` threshold, promote it to a required check.

- [ ] **3A.17** Create a combined test quality dashboard script

  A lightweight script that runs all three layers and outputs a unified summary. Add as `client/.scripts/test-quality-dashboard.mjs`:

  ```javascript
  /**
   * Test Quality Dashboard
   *
   * Runs all test quality tools and outputs a unified summary:
   * 1. Code coverage (vitest --coverage)
   * 2. Behavioral alignment audit
   * 3. Mutation score (if Stryker report exists)
   *
   * Usage: npm run test:quality
   */

  import { existsSync, readFileSync } from 'fs'
  import { join } from 'path'
  import { execSync } from 'child_process'

  console.log('═══════════════════════════════════════════')
  console.log('  TEST QUALITY DASHBOARD')
  console.log('═══════════════════════════════════════════\n')

  console.log('1. Running behavioral alignment audit...')
  execSync('node .scripts/test-alignment-audit.mjs', { stdio: 'inherit' })

  const alignmentReport = join(process.cwd(), '.audit-reports/test-alignment-audit.json')
  if (existsSync(alignmentReport)) {
    const data = JSON.parse(readFileSync(alignmentReport, 'utf-8'))
    console.log(`   Alignment: ${data.summary.averageAlignmentScore}/6 average`)
    console.log(`   Grade A: ${data.summary.gradeDistribution.A} | B: ${data.summary.gradeDistribution.B} | C: ${data.summary.gradeDistribution.C} | D: ${data.summary.gradeDistribution.D}`)
  }

  console.log('\n2. Checking for Stryker mutation report...')
  const mutationReport = join(process.cwd(), '.mutation-reports/mutation-report.html')
  if (existsSync(mutationReport)) {
    console.log('   Mutation report found. Open .mutation-reports/mutation-report.html in browser.')
  } else {
    console.log('   No mutation report found. Run: npm run test:mutate')
  }

  console.log('\n3. Run code coverage separately: npx vitest run --coverage')
  console.log('\n═══════════════════════════════════════════')
  console.log('  RECOMMENDATIONS')
  console.log('═══════════════════════════════════════════')
  console.log('  - Fix Grade D files first (highest risk)')
  console.log('  - Target mutation score > 70% on booking logic')
  console.log('  - Add property tests for any pure function')
  console.log('═══════════════════════════════════════════\n')
  ```

  Add to `client/package.json`:
  ```json
  {
    "scripts": {
      "test:quality": "node .scripts/test-quality-dashboard.mjs"
    }
  }
  ```

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mutation testing tool | Stryker Mutator | Only mature JS/TS mutation testing framework; first-class Vitest support |
| Property-based testing | fast-check | Most popular JS property-based testing library; integrates with Vitest natively |
| Mutation CI gate | Non-blocking initially | Avoid blocking PRs until mutation scores are stable and thresholds are calibrated |
| Property test files | Separate `.property.test.ts` files | Keeps fast-running example-based tests separate from slower property-based tests |
| Alignment audit | Custom script (matches existing audit pattern) | Consistent with existing `.scripts/` audit infrastructure |

### Learning Checkpoint

After completing this phase, you should be able to answer:

- **What:** What is the difference between code coverage and mutation score?
- **Why:** Why can a test with 100% coverage still fail to catch bugs?
- **How:** How does Stryker decide what mutations to make? How does fast-check decide what inputs to generate?
- **When:** When should you use property-based tests vs example-based tests?
- **Where:** Where in the CI pipeline should mutation testing run, and why?

---

## Phase 4: CI/CD Pipeline Enhancement

**Goal:** Automate the path from code push to deployed application.

### Checklist

- [ ] **4.1** Expand CI branch triggers
  - Add feature branches to push triggers (or use `**` wildcard)
  - Ensure PRs into `main` from any branch trigger CI
- [ ] **4.2** Add staging deployment job to CI
  - Trigger: On push to `main` (after all checks pass)
  - Action: Trigger Render deploy via deploy hook or Render API
  - Render auto-deploys from GitHub by default — verify this is configured
- [ ] **4.3** Add deployment verification step
  - After deploy, run a health check against the staging URL
  - Verify API responds with 200
  - Verify static site loads
- [ ] **4.4** Add environment-specific build configurations
  - Client: `VITE_API_BASE_URL` varies by environment (dev, staging, production)
  - Server: Database credentials vary by environment
  - Use GitHub Secrets for sensitive values
- [ ] **4.5** Consider branch-based preview deployments
  - Render supports preview environments for PRs
  - Useful for testing changes before merging to main
- [ ] **4.6** Add CI caching for faster builds
  - Cache `node_modules` between runs (partially done via `actions/setup-node` cache)
  - Consider caching Playwright browsers for E2E jobs

---

## Phase 5: Production Readiness

**Goal:** Monitoring, logging, error tracking, and operational essentials.

### Checklist

- [ ] **5.1** Add health check endpoint
  - `GET /api/v1/health` — returns `{ status: 'ok', database: 'connected', timestamp: ... }`
  - Check database connectivity
  - Used by Render for health monitoring and by CI for deployment verification
- [ ] **5.2** Set up error tracking (Sentry recommended)
  - Server: `@sentry/node` — captures unhandled exceptions, request errors
  - Client: `@sentry/vue` — captures component errors, unhandled rejections
  - Free tier: 5K errors/month (sufficient for alpha)
  - Integrate with existing error handler in `server/src/middlewares/errorHandler.ts`
- [ ] **5.3** Add structured logging for production
  - Current logger writes to console — fine for Render (captures stdout)
  - Ensure production log level is `warn` or `info` (not `debug`)
  - Consider adding request ID to logs for traceability
- [ ] **5.4** Set up database backups
  - Render Starter PostgreSQL includes daily backups
  - For free tier: set up a cron job or manual backup script using `pg_dump`
- [ ] **5.5** Add uptime monitoring
  - Options: UptimeRobot (free), Better Uptime, Render's built-in monitoring
  - Monitor health check endpoint
  - Set up email/SMS alerts for downtime
- [ ] **5.6** Review and configure production environment variables
  - Audit all `process.env` references in server code
  - Ensure all required variables are set in Render
  - Ensure Google OAuth redirect URIs include production URL
- [ ] **5.7** Create production database migration strategy
  - How to run migrations on deploy (Render pre-deploy command or build script)
  - How to roll back if a migration fails
  - Document the process
- [ ] **5.8** Document and test rollback procedures (see Rollback Plan below)

### Rollback Plan

**Application rollback (Render):**
- Render keeps every deploy as an immutable build. To rollback: go to the service dashboard → Deploys → click "Redeploy" on the last known-good deploy. Takes ~30 seconds. No code changes needed.
- For the static site, same process — Render stores every build.
- **Decision:** Do NOT use auto-deploy initially. Use manual deploy triggers so you control exactly when a new version goes live. Once stable, switch to auto-deploy from `main`.

**Database migration rollback:**
- Every migration in `server/src/db/migrations/` has an `up` and `down` function. Run `npm run migrate:undo` to reverse the last migration.
- **Critical rule:** Never run a destructive migration (dropping columns/tables) without first verifying the `down` function works locally.
- **Procedure when a migration fails in production:**
  1. Stop the API service (Render dashboard → Suspend Service)
  2. Connect to the database via Render Shell or `psql`
  3. Run `npm run migrate:undo` to reverse the failed migration
  4. Redeploy the previous application version (see above)
  5. Resume the API service
  6. Investigate and fix the migration locally before re-attempting

**Seed data rollback:**
- Seed data (`npm run seed`) should be idempotent — verify that re-running seeds doesn't create duplicates (use `findOrCreate` or `ON CONFLICT` patterns)
- If seed data needs to be reset: truncate the relevant tables and re-seed, or restore from a database backup

**When to rollback vs. hotfix:**
- **Rollback** if: the app is completely broken (white screen, 500 errors on all routes, database corruption)
- **Hotfix** if: a specific feature is broken but the rest of the app works — fix the code, push to `main`, deploy the fix

---

## Phase 6: Pre-Launch Polish

**Goal:** Final checks and quality of life improvements before inviting alpha testers.

### Checklist

- [ ] **6.1** Verify beta feedback system works end-to-end in production
  - Test: Submit feedback from booking wizard → verify it appears in admin dashboard
  - Ensure `reporterEmail` field works correctly
- [ ] **6.2** Add Vue error boundary component
  - Graceful fallback UI when a component crashes
  - Log error to Sentry (if set up)
  - Provide "reload" action for user
- [ ] **6.3** Review loading and error states across all views
  - Booking wizard: loading spinners, error messages, retry buttons
  - Admin panel: loading states for CRUD operations, error toasts
  - Network errors: user-friendly messages (not raw error objects)
- [ ] **6.4** Test on multiple devices and browsers
  - Desktop: Chrome, Firefox, Safari
  - Mobile: iOS Safari, Android Chrome
  - Verify touch targets are >= 44x44px
  - Verify text is readable (>= 16px)
- [ ] **6.5** Review and update README.md
  - Add deployment instructions
  - Add environment setup guide for new developers
  - Add architecture overview
- [ ] **6.6** Create alpha tester onboarding guide
  - How to access the app
  - What to test
  - How to submit feedback (beta feedback widget)
  - Known limitations / things not to test yet
  - **Note:** Phase 6A below replaces the static onboarding document with an interactive in-app guided testing system

---

## Phase 6A: Beta Tester Onboarding & Guided Testing

**Goal:** Provide an interactive, in-app guided testing experience that welcomes beta testers, assigns them randomized test tasks across all feature areas, collects structured feedback per task, and gives you analytics on test coverage across your tester pool.

**Why Database-Driven:** Static checklists give every tester the same list. A database-driven system lets you randomly distribute tasks so different testers exercise different features, track which features have been tested by how many people, curate specific test data (addresses, configurations) without redeploying, and link each task directly to the feedback it generates.

**Dependency:** Requires Phase 2A (authentication) — task assignment needs user identity. The UI component (6A.9–6A.11) can be scaffolded before auth is live using localStorage for identity, then upgraded to server-backed assignment once auth lands.

### Architecture

```
Beta Guided Testing System
─────────────────────────────────────────────────────────

  DATABASE LAYER
  ├── beta_test_tasks         — Pool of test tasks (curated by you)
  │   ├── feature_area, difficulty, estimated_minutes
  │   ├── test_data (JSONB)   — Specific addresses, user types, expected results
  │   └── min_completions     — Coverage target per task
  ├── beta_test_assignments   — Who got what, and did they finish
  │   ├── user_id (FK → users)
  │   ├── task_id (FK → beta_test_tasks)
  │   ├── status              — assigned → in_progress → completed / skipped
  │   └── feedback_id (FK → beta_feedback)  — Links task to submitted feedback
  └── beta_test_addresses     — Curated properties for address-dependent tasks
      ├── address, place_id, property_type
      └── expected_features   — What MLS enrichment should return

  SERVER LAYER
  ├── GET  /beta-testing/my-tasks     — Assignment algorithm + return tester's tasks
  ├── PATCH /beta-testing/tasks/:id   — Update task status (start, complete, skip)
  ├── GET  /beta-testing/coverage     — Admin: coverage analytics across all testers
  └── CRUD /beta-testing/tasks        — Admin: manage the task pool

  CLIENT LAYER
  └── BetaTestingGuide.vue            — Floating panel (bottom-left)
      ├── Welcome section             — Project description + login prompt
      ├── Task checklist              — Randomized tasks with status tracking
      ├── Per-task feedback shortcut  — Pre-fills BetaFeedbackModal with task context
      └── Minimizable                 — Collapses to tab, auto-opens on first visit
```

### Assignment Algorithm

When a tester requests their tasks (`GET /beta-testing/my-tasks`), the server:

1. Checks existing assignments for this user
2. If fewer than `TASKS_PER_TESTER` (configurable, e.g. 8–12), assigns more from the pool
3. Scoring for candidate selection:
   - **Coverage priority:** Tasks with fewer completions relative to `min_completions` score higher
   - **Variety:** Feature areas the tester hasn't been assigned yet score higher
   - **Difficulty mix:** Balance easy/medium/hard across each tester's set
4. Weighted random selection from scored candidates (not purely random — biased toward coverage gaps)
5. Creates `beta_test_assignments` rows with `status = 'assigned'`

This ensures every feature area gets tested by multiple people, while no single tester gets an overwhelming or repetitive set.

### Database Schema

#### `beta_test_tasks` — The Task Pool

```sql
CREATE TABLE public.beta_test_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task definition
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT,

  -- Classification
  feature_area VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  estimated_minutes INTEGER NOT NULL DEFAULT 10,

  -- Test data — specific addresses, user types, expected results, etc.
  test_data JSONB NOT NULL DEFAULT '{}',

  -- Distribution control
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_completions INTEGER NOT NULL DEFAULT 3,
  max_assignments INTEGER NOT NULL DEFAULT 5,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX beta_test_tasks_feature_area_idx
  ON public.beta_test_tasks (feature_area)
  WHERE is_active = true;
```

**Feature area values:** `booking_wizard`, `composite_blocks`, `differential_view`, `non_differential_view`, `property_details`, `availability`, `contacts`, `confirmation`, `admin_instances`, `admin_business_controls`, `calendar_integration`, `drive_time`, `address_autocomplete`, `mobile`, `quote_mode`

**Difficulty values:** `easy`, `medium`, `hard`

#### `beta_test_assignments` — Who Got What

```sql
CREATE TABLE public.beta_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'assigned',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Link to feedback submitted for this task
  feedback_id UUID,

  -- Tester notes
  notes TEXT,

  CONSTRAINT beta_test_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT beta_test_assignments_task_fkey
    FOREIGN KEY (task_id) REFERENCES public.beta_test_tasks(id) ON DELETE CASCADE,
  CONSTRAINT beta_test_assignments_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT beta_test_assignments_feedback_fkey
    FOREIGN KEY (feedback_id) REFERENCES public.beta_feedback(id) ON DELETE SET NULL,
  CONSTRAINT beta_test_assignments_unique UNIQUE (task_id, user_id)
);

CREATE INDEX beta_test_assignments_user_idx ON public.beta_test_assignments (user_id);
CREATE INDEX beta_test_assignments_task_status_idx ON public.beta_test_assignments (task_id, status);
```

**Status values:** `assigned`, `in_progress`, `completed`, `skipped`

#### `beta_test_addresses` — Curated Test Properties

```sql
CREATE TABLE public.beta_test_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Address data
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  place_id VARCHAR(255),

  -- What this address tests
  property_type VARCHAR(50),
  has_mls_data BOOLEAN NOT NULL DEFAULT false,
  expected_features JSONB NOT NULL DEFAULT '[]',

  -- Usage
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Example `test_data` JSONB

```json
{
  "addressId": "uuid-of-beta-test-address",
  "userType": "buyer",
  "expectedServices": ["Full Inspection", "Radon Test"],
  "steps": [
    "Select 'Buyer' as user type",
    "Select 'Full Inspection' — verify component blocks appear",
    "Enter the provided address in the autocomplete",
    "Verify MLS data auto-populates square footage and bedrooms",
    "Proceed to availability and select a date"
  ]
}
```

### Feature Areas & Example Tasks

| Feature Area | Example Task Title | Difficulty | Est. Min | Needs Address? |
|---|---|---|---|---|
| `booking_wizard` | Complete a full booking end-to-end | medium | 15 | Yes |
| `composite_blocks` | Book a composite service and verify components | medium | 10 | No |
| `differential_view` | Book a differential service, toggle major/minor | medium | 10 | No |
| `non_differential_view` | Book a non-differential service, verify standard slots | easy | 8 | No |
| `property_details` | Enter a multi-family address, verify unit number field | medium | 8 | Yes |
| `property_details` | Enter a known MLS address, verify auto-populate | medium | 8 | Yes |
| `availability` | Select a date and verify time slots load correctly | easy | 5 | No |
| `availability` | Check that a busy calendar day has fewer slots | hard | 12 | No |
| `contacts` | Add optional contacts (Transaction Manager, Seller) | easy | 5 | No |
| `contacts` | Book a service that requires an agent, verify required fields | medium | 8 | No |
| `confirmation` | Verify price breakdown matches selected services | medium | 10 | No |
| `confirmation` | Toggle quote mode and verify theme changes | easy | 3 | No |
| `admin_instances` | Create a new block instance, then duplicate it | medium | 10 | No |
| `admin_instances` | Drag-and-drop reorder block instances | easy | 5 | No |
| `admin_business_controls` | Change business hours, verify availability updates | hard | 15 | No |
| `calendar_integration` | Verify Google Calendar busy times block slots | hard | 12 | No |
| `drive_time` | Book at an address far from default, check drive time in slots | hard | 15 | Yes |
| `address_autocomplete` | Search for an address, verify suggestions appear | easy | 3 | Yes |
| `address_autocomplete` | Select address, verify field expansion with details | easy | 5 | Yes |
| `mobile` | Complete booking flow on a mobile device | medium | 15 | Yes |
| `quote_mode` | Complete a quote (not a booking), verify different behavior | medium | 10 | No |

### UI Component: `BetaTestingGuide.vue`

```
┌─────────────────────────────────────────────────────┐
│                    Your App                         │
│                                                     │
│                                                     │
├──────────────────────────┐              ┌───────────┤
│ 🔬 Beta Testing Guide    │              │   [FAB]   │ ← existing feedback button
│                          │              └───────────┘
│ Welcome, [Name]!         │
│ Thanks for helping test   │
│ the DHP Scheduler.       │
│                          │
│ Your testing tasks:      │
│ ☑ Search for an address  │
│ ◻ Book a composite svc   │
│ ◻ Try differential view  │
│ ◻ Toggle quote mode      │
│                          │
│ [◻ → opens pre-filled    │
│  feedback modal]         │
│                          │
│ [Minimize]               │
└──────────────────────────┘
```

Behaviors:
- **Auto-opens on first visit** (localStorage flag, upgraded to server-side after auth)
- **Minimizes to a small tab** on the left edge ("Beta Guide") — testers can reopen anytime
- **Welcome section:** Brief project description, tester's name (from auth), link to known limitations
- **Task checklist:** Each task shows title, estimated time, difficulty badge
- **Task expansion:** Clicking a task shows full description, test_data steps, and a "Give Feedback" button
- **"Give Feedback" button:** Opens the existing `BetaFeedbackModal` pre-filled with the task's `prompt` as description hint, `feature_area` mapped to feedback category, and the `assignment.id` stored so the resulting feedback links back
- **Completion:** Tester marks a task done → status updates to `completed` on the server → "Give Feedback" prompt appears
- **Position:** Bottom-left, fixed, z-index 1000 — mirrors the feedback FAB on the bottom-right

### Checklist

#### Database & Models

- [ ] **6A.1** Create database migration for `beta_test_tasks`, `beta_test_assignments`, and `beta_test_addresses` tables
  - Migration file: `server/src/db/migrations/20260XXX_100000_create_beta_testing_guide.mjs`
  - Schema as defined above
  - Indexes for feature_area (partial on is_active), user_id, and (task_id, status)
- [ ] **6A.2** Create Sequelize models: `BetaTestTask`, `BetaTestAssignment`, `BetaTestAddress`
  - Follow existing pattern from `server/src/db/models/beta/beta_feedback.ts`
  - Place in `server/src/db/models/beta/`
  - Register in `server/src/db/models/index.ts` with associations:
    - `BetaTestTask.hasMany(BetaTestAssignment)`
    - `BetaTestAssignment.belongsTo(BetaTestTask)`
    - `BetaTestAssignment.belongsTo(User)`
    - `BetaTestAssignment.belongsTo(BetaFeedback)` (optional FK)

#### Seed Data

- [ ] **6A.3** Create seed script for test tasks
  - Seed file: `server/src/db/seeders/beta_test_tasks.mjs`
  - Populate ~20–25 tasks across all feature areas (see table above)
  - Balance: ~8 easy, ~10 medium, ~5 hard
  - Include `test_data` JSONB with specific steps for each task
- [ ] **6A.4** Create seed script for test addresses
  - Seed file: `server/src/db/seeders/beta_test_addresses.mjs`
  - Curate 5–8 real addresses in the DHP service area:
    - At least 1 single-family with MLS data
    - At least 1 multi-family (triggers unit number field)
    - At least 1 condo
    - At least 1 address far from default location (tests drive time)
    - At least 1 address with known MLS features (pool, deck, etc.)
  - Include Google Place IDs where possible (for autocomplete testing)

#### Server API

- [ ] **6A.5** Create task assignment algorithm in `server/src/services/beta/betaTestingAssignmentService.ts`
  - `assignTasksToUser(userId)` — scores and selects tasks, creates assignment rows
  - Configurable `TASKS_PER_TESTER` (default: 10)
  - Scoring: coverage priority + variety + difficulty mix + weighted randomness
  - Returns assigned tasks with full task details and address data
- [ ] **6A.6** Create beta testing API router
  - Mount at `/api/v1/internal/beta-testing`
  - `GET /my-tasks` — calls assignment algorithm, returns tester's tasks (requires auth)
  - `PATCH /tasks/:assignmentId` — update status (`in_progress`, `completed`, `skipped`), attach `feedback_id`
  - `GET /coverage` — admin endpoint: coverage stats by feature area, completion counts, under-tested tasks
  - `GET /tasks` — admin endpoint: list all tasks with assignment counts
  - `POST /tasks` — admin endpoint: create new task
  - `PATCH /tasks/:taskId` — admin endpoint: update task definition
  - `DELETE /tasks/:taskId` — admin endpoint: deactivate task (soft delete via `is_active = false`)
  - Protect tester routes with `requireAuth`; protect admin routes with `requireAuth` + `requireRole('admin')`
- [ ] **6A.7** Add Joi validation for beta testing endpoints
  - Validate task creation/update payloads
  - Validate status transitions (e.g., can't go from `completed` back to `assigned`)
  - Validate `feature_area` and `difficulty` against allowed values

#### Client Components

- [ ] **6A.8** Create `useBetaTesting` composable
  - File: `client/src/composables/beta/useBetaTesting.ts`
  - `fetchMyTasks()` — GET /beta-testing/my-tasks
  - `updateTaskStatus(assignmentId, status)` — PATCH
  - `fetchCoverage()` — GET /beta-testing/coverage (admin)
  - Reactive state: `tasks`, `loading`, `error`
- [ ] **6A.9** Create `BetaTestingGuide.vue` — floating panel component
  - File: `client/src/components/beta/BetaTestingGuide.vue`
  - Fixed position bottom-left, z-index 1000
  - Sections: welcome, task list, minimize button
  - Auto-opens on first visit (localStorage `beta-guide-seen` flag)
  - Minimizes to a tab on the left edge
  - Responsive: full panel on desktop, bottom sheet on mobile
- [ ] **6A.10** Create `BetaTestItem.vue` — individual task row in the panel
  - File: `client/src/components/beta/BetaTestItem.vue`
  - Shows: checkbox, title, difficulty badge, estimated time
  - Expandable: reveals description, steps from `test_data`, "Give Feedback" button
  - "Give Feedback" click: emits event with task context → parent opens `BetaFeedbackModal` pre-filled
- [ ] **6A.11** Integrate feedback linkage
  - When "Give Feedback" is clicked from a task, pass `assignmentId` and pre-fill data to `BetaFeedbackModal`
  - After feedback is submitted, update the assignment's `feedback_id` with the new feedback record
  - Modify `BetaFeedbackModal` to accept optional `prefill` prop: `{ description, category, assignmentId }`
  - Map `feature_area` → `FeedbackCategory` (e.g., `drive_time` → `performance`, `composite_blocks` → `usability`)

#### Admin Coverage Dashboard

- [ ] **6A.12** Create `BetaTestingCoverageView.vue` — admin analytics page
  - File: `client/src/views/beta/BetaTestingCoverageView.vue`
  - Route: `/beta-testing/coverage`
  - Coverage heatmap by feature area: shows completions vs. `min_completions` target
  - Per-task table: task title, assignments count, completions count, skip rate, linked feedback count
  - Per-tester table: tester name, tasks assigned, tasks completed, tasks skipped
  - Highlight under-tested areas (completions < min_completions) in warning color

#### Integration

- [ ] **6A.13** Mount `BetaTestingGuide.vue` in the main app layout
  - Add alongside existing `BetaFeedbackWidget` (feedback = bottom-right, guide = bottom-left)
  - Only show when user is authenticated (hide behind auth check)
  - Fallback for pre-auth: show welcome + "Log in to see your testing tasks" prompt with Magic Link form
- [ ] **6A.14** Add route for coverage dashboard in `client/src/router/index.ts`
  - `/beta-testing/coverage` → `BetaTestingCoverageView.vue`
  - Requires admin role

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Task storage | PostgreSQL tables | Randomization requires global state; coverage tracking requires aggregation; test data needs curation without redeployment |
| Assignment algorithm | Server-side weighted random | Client-side random can't guarantee cross-tester coverage; weighted scoring ensures under-tested features get priority |
| Test addresses | Separate table | Reusable across multiple tasks; can be updated independently; structured data for validation |
| `test_data` format | JSONB | Flexible per-task schema — some tasks need addresses, some need user types, some need expected results |
| UI position | Bottom-left floating panel | Coexists with feedback FAB (bottom-right); doesn't compete for the same space |
| Feedback linkage | FK from assignment → beta_feedback | Connects structured testing to unstructured feedback; enables "which tasks generated the most bugs?" analytics |
| Pre-auth fallback | localStorage identity | Lets the guide component be scaffolded before auth lands; localStorage stores name/email temporarily |

---

## Phase 7: Native App Shell (Capacitor → Ionic)

**Goal:** Package the app as a native iOS/Android build. The primary path is: complete Admin UI Overhaul (Feature 17), migrate wizard (and admin as scoped) to Ionic Vue, then wrap the Ionic app in Capacitor and ship to the App Store / Play Store. This work is scheduled **between Alpha Ready and Beta Ready** (see "Between Alpha and Beta" above).

**Why Two Stages:** Stage 1 (Capacitor only) wraps the current Vuetify SPA as-is — zero component changes, quick native shell. Stage 2 (Ionic Vue conversion) is the main path for a shippable native app: it happens after Feature 17 (Admin UI Overhaul) so we migrate fewer, clearer components. Ionic runs as a native iOS app directly (via Capacitor), so the Apple Store version is the Ionic-based build.

**Strategy:**
- **Stage 1 (Capacitor Shell):** Optional early path. Wrap the existing Vuetify SPA in Capacitor. Web version stays identical. Native app is the same UI in a native container. Access to native APIs via Capacitor plugins.
- **Stage 2 (Ionic Vue conversion):** Planned for the post-alpha, pre-beta window. After Feature 17, convert the booking wizard (and admin if in scope) to Ionic Vue. Then add Capacitor and produce iOS/Android builds. The Apple Store version is this Ionic app in a Capacitor shell.

**Dependencies:**
- Stage 1 depends on Phase 1 (Hosting & Deployment) — the app needs a deployed API for the native shell to talk to
- Stage 2 depends on Feature 17 (Admin UI Overhaul) — done between alpha and beta
- Stage 2 depends on Feature 16 Phase 16.3 (Responsive Design & Mobile Optimization) for mobile UX baseline when applicable

### Stage 1: Capacitor Shell

**Goal:** Wrap the existing Vue + Vuetify SPA as a native iOS and Android app. No component changes — the web build is loaded inside native WebView containers.

#### Checklist

- [ ] **7.1** Install Capacitor dependencies
  - `npm install @capacitor/core @capacitor/cli` in `client/`
  - `npx cap init` — generates `capacitor.config.ts` (set `webDir: 'dist'`)
- [ ] **7.2** Add iOS platform
  - `npx cap add ios` — generates `ios/` folder with Xcode project
  - Requires macOS with Xcode installed
  - Verify: `npx cap open ios` → app loads in Xcode simulator
- [ ] **7.3** Add Android platform
  - `npx cap add android` — generates `android/` folder with Android Studio project
  - Requires Android Studio installed
  - Verify: `npx cap open android` → app loads in Android emulator
- [ ] **7.4** Configure Capacitor for production API
  - Set `server.url` in `capacitor.config.ts` for development (local API)
  - Production builds use the bundled `dist/` assets, pointing at the Render API via `VITE_API_BASE_URL`
  - Verify: native app connects to hosted API, not localhost
- [ ] **7.5** Add PWA support (web fallback)
  - Install `vite-plugin-pwa` in `client/`
  - Add `manifest.json` with app name, icons, theme colors
  - Configure service worker for offline caching of static assets
  - Users who don't install the native app can "Add to Home Screen" from the browser
- [ ] **7.6** Add app icons and splash screens
  - Generate icon set for iOS (1024x1024 base) and Android (512x512 base)
  - Use `@capacitor/splash-screen` plugin for launch screen
  - Configure splash screen auto-hide after app loads
- [ ] **7.7** Configure native permissions
  - Audit which Capacitor plugins are needed (push notifications, camera, etc.)
  - Add required permissions to `Info.plist` (iOS) and `AndroidManifest.xml` (Android)
  - Start minimal — only add permissions as features require them
- [ ] **7.8** Add Capacitor sync to build pipeline
  - After `vite build`, run `npx cap sync` to copy `dist/` into native projects
  - Add npm script: `"cap:sync": "npx cap sync"`, `"cap:build": "npm run build && npx cap sync"`
  - Update `.gitignore` for native build artifacts (keep `ios/` and `android/` in git for reproducibility)
- [ ] **7.9** Test native app end-to-end
  - Booking wizard flow works on iOS simulator
  - Booking wizard flow works on Android emulator
  - Admin panel works (desktop-oriented but functional on tablet)
  - API calls reach hosted backend
  - Deep links / routing works within the native shell
- [ ] **7.10** App Store / Play Store preparation (optional — can defer)
  - Create Apple Developer account ($99/year) if targeting iOS App Store
  - Create Google Play Developer account ($25 one-time) if targeting Play Store
  - Prepare store metadata: description, screenshots, category, privacy policy URL

### Stage 2: Selective Ionic Vue Conversion (Post Admin UI Overhaul)

**Goal:** After the Admin UI Overhaul simplifies the component architecture, convert the customer-facing booking wizard (and admin, as scoped) to Ionic Vue components for a native-feeling mobile experience. Admin panel can stay on Vuetify. This is planned **between Alpha Ready and Beta Ready** so the native app (Ionic → Capacitor → Apple Store) is ready before inviting beta testers.

**Prerequisite:** Feature 17 (Admin UI Overhaul) must be complete — the overhaul reduces the component set so the Ionic migration targets fewer, clearer components.

#### Checklist

- [ ] **7.11** Evaluate whether Ionic conversion is warranted
  - Review real user feedback from beta on mobile booking UX
  - Assess whether Vuetify-in-Capacitor provides adequate mobile experience
  - If mobile UX is satisfactory, skip Stage 2 entirely
  - Decision gate: only proceed if user feedback indicates mobile-native UX is needed
- [ ] **7.12** Install Ionic Vue alongside Vuetify
  - `npm install @ionic/vue @ionic/vue-router` in `client/`
  - Configure Ionic CSS imports (core, normalize, structure, typography)
  - Verify: both Vuetify and Ionic components render without CSS conflicts
- [ ] **7.13** Create Ionic-based booking wizard shell
  - New route group for the booking wizard using `IonPage`, `IonContent`, `IonHeader`
  - Booking wizard steps use Ionic navigation patterns (slide transitions, swipe-back)
  - Keep admin panel routes on Vuetify — no changes to admin
- [ ] **7.14** Convert booking wizard components to Ionic
  - Replace Vuetify components with Ionic equivalents in booking step components
  - `v-btn` → `ion-button`, `v-card` → `ion-card`, `v-text-field` → `ion-input`, etc.
  - Composable logic stays untouched — only templates change
  - Verify: all booking wizard functionality preserved with Ionic components
- [ ] **7.15** Test hybrid app (Vuetify admin + Ionic booking)
  - Admin panel: Vuetify components render correctly, all CRUD operations work
  - Booking wizard: Ionic components render with native-feeling UX
  - Transitions between admin and booking routes are smooth
  - Bundle size impact is acceptable (two component libraries)
- [ ] **7.16** Optimize bundle for hybrid setup
  - Tree-shake unused Ionic and Vuetify components
  - Consider code-splitting: Ionic CSS only loaded on booking routes
  - Measure and document bundle size impact

### Converting to and launching the app version (commentary and steps)

**Overview:** After the Ionic migration (Stage 2), the same codebase serves web and native. Capacitor wraps the built web assets in a native container; iOS and Android each get a project (e.g. `ios/`, `android/`) that you build and run in Xcode / Android Studio. Launching "the app version" means producing a store-ready build and submitting it.

**Step-by-step (with commentary):**

1. **Prerequisites**
   - Feature 17 (Admin UI Overhaul) complete; wizard (and admin if scoped) migrated to Ionic Vue.
   - Production API deployed and reachable (e.g. Render). The native app will call this API; ensure CORS and auth work for the app’s origin/bundle id if required.

2. **Capacitor setup**
   - In `client/`: `npm install @capacitor/core @capacitor/cli`, `npx cap init`. Set `webDir` to your build output (e.g. `dist`). This is the folder that gets copied into the native projects.
   - **Commentary:** Every time you change the web app, run `npm run build` (or your build command) then `npx cap sync` so the native projects get the latest assets. Add `cap:sync` and `cap:build` scripts to avoid forgetting.

3. **Add platforms**
   - `npx cap add ios` (requires macOS and Xcode), `npx cap add android` (requires Android Studio). This creates `ios/` and `android/` with native projects.
   - **Commentary:** Commit these folders (or document how to regenerate them) so other devs and CI can build. Ignore build artifacts (e.g. `ios/App/build`) in `.gitignore` if desired, but keep the project structure.

4. **Configure for production**
   - Set the app’s API base URL via env (e.g. `VITE_API_BASE_URL`) so the built app talks to your hosted API, not localhost. In `capacitor.config.ts`, you can set `server.url` for live-reload during dev; for production builds the bundle uses the compile-time env.
   - Set app identity: bundle id / package name, display name, icons, splash screen. iOS uses `Info.plist` and asset catalogs; Android uses `AndroidManifest.xml` and res folders.

5. **Build and run locally**
   - `npm run build` (or equivalent) in client, then `npx cap sync`. Open iOS: `npx cap open ios` → run in simulator. Open Android: `npx cap open android` → run in emulator. Verify: booking wizard (and admin) load, API calls succeed, navigation and deep links work.
   - **Commentary:** Test on at least one physical device before store submission; simulator behavior can differ (keyboard, permissions, performance).

6. **iOS: Apple Store path**
   - **Apple Developer account:** Enroll at developer.apple.com ($99/year). Required for App Store and for signing.
   - **Signing and capabilities:** In Xcode, select the app target → Signing & Capabilities. Choose your team and let Xcode manage signing, or use a distribution certificate and provisioning profile. Add capabilities (e.g. Push Notifications) only if the app uses them.
   - **Archive and upload:** Product → Archive. In Organizer, validate then distribute to App Store Connect. Upload builds for the version you set in the project (e.g. CFBundleShortVersionString).
   - **App Store Connect:** Create the app record if needed; attach the build; fill in metadata (description, screenshots, category, privacy policy URL, etc.). Submit for review.
   - **Commentary:** Screenshots must match device sizes (e.g. 6.5" and 5.5" for iPhone). Use simulator or device to capture. First submission often takes 24–48 hours for review.

7. **Android: Play Store path**
   - **Play Developer account:** Create at play.google.com/console ($25 one-time). Create an app, set up store listing (description, graphics, category).
   - **Build:** In Android Studio, Build → Generate Signed Bundle / APK. Use a release keystore (keep it safe; you need it for all future updates). Upload the AAB (or APK if required) to the Play Console.
   - **Commentary:** Play often requires a privacy policy URL and may require target SDK and permissions to be up to date. Test on a few devices; fragmentation is higher than on iOS.

8. **Ongoing releases**
   - Bump version in both client (e.g. `package.json`, or env) and native projects (iOS: `Info.plist` / project settings; Android: `versionCode` / `versionName`). Build → sync → archive/package → upload. Consider CI (e.g. Fastlane, or GitHub Actions with signing) for repeatable builds.

**Summary checklist (store launch):** [ ] Overhaul and Ionic migration done; [ ] Capacitor init and platforms added; [ ] Production API URL and app identity set; [ ] Local build and run in simulator/emulator passing; [ ] iOS: Apple Developer account, signing, archive, upload, App Store Connect metadata and submit; [ ] Android (optional): Play account, signed build, Play Console metadata and submit.

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stage 1 framework | Capacitor (no Ionic UI) | Zero component changes, immediate native shell, preserves all existing Vuetify UI |
| Stage 2 timing | After Admin UI Overhaul | Overhaul simplifies components first — fewer to convert, cleaner architecture |
| Stage 2 scope | Booking wizard only | Customer-facing flow benefits most from native mobile UX; admin panel is desktop-focused |
| Admin panel framework | Stays Vuetify | Vuetify has superior data tables, form components, and desktop layout tools |
| PWA | Added in Stage 1 | Low-effort fallback for users who don't install native app; complements Capacitor |
| Stage 2 timing (plan) | Between Alpha and Beta | UI overhaul and Ionic migration are scheduled after Alpha Ready and before Beta Ready so the native app is available for beta testers |
| Stage 2 gate (optional) | User feedback | If desired, still evaluate after alpha whether Ionic is warranted; the default plan is to proceed so the Apple Store version is Ionic-based |

---

## Phase 8A: Admin Force-Create & Blocker Exception Records

**Goal:** Allow admins to force-create an appointment on any date/time — bypassing all availability blockers (capacity limits, overlap conflicts, business hours, lead time) — and persist a record of which constraints were overridden so the system can honor those same exceptions during a future reschedule.

**Why:** Real-world scheduling requires override capability. A VIP client calls and needs a specific slot. The inspector wants to squeeze in a short job after hours. The current constraint system correctly blocks these — but an admin needs a deliberate escape hatch that is auditable, recorded, and carried forward if the appointment is later rescheduled.

**Dependency:** Phase 2A (Authentication) must be complete — force-create requires `req.user` to record who authorized the override.

### Architecture

```
Admin Force-Create & Blocker Exception Flow
──────────────────────────────────────────────────────────

  FORCE-CREATE FLOW (admin-initiated)
  ────────────────────────────────────
  1. Admin picks a date/time (even a blocked slot)
  2. Client calls POST /api/v1/internal/appointments/force-create
     with: { appointmentData, selectedSlot: { startTime, endTime } }
  3. Server runs normal slot computation for that exact time
     → collects ALL violations (range, overlap, capacity) instead of rejecting
  4. Server creates the appointment regardless of violations
  5. Server creates a constraint_override record linking:
     - appointment_id → the new appointment
     - overridden_violations → ['overlap.event.direct', 'capacity.daily', ...]
     - authorized_by_id → req.user.id (the admin who approved)
     - reason → optional free-text note ("VIP client requested this slot")
  6. Response includes both the appointment and the override record

  RESCHEDULE FLOW (honoring existing overrides)
  ──────────────────────────────────────────────
  1. Admin initiates reschedule for an appointment that has a constraint_override record
  2. Client fetches the override record for that appointment
  3. When computing availability for the new slot, client passes overridden_violations
     to the server as allowedExceptions
  4. Server slot computation treats those specific constraint types as 'off' for this request
     → the rescheduled slot is not blocked by the same constraints the original override allowed
  5. New override record is created for the rescheduled appointment (preserves audit trail)

  DATA MODEL
  ──────────
  constraint_overrides table
  ├── id                    UUID PK
  ├── appointment_id        FK → appointments.id (ON DELETE CASCADE)
  ├── overridden_violations STRING[] — violation keys from ComputedSlot.violations
  ├── authorized_by_id      FK → users.id (the admin who approved)
  ├── reason                TEXT — optional free-text note
  ├── slot_start            TIMESTAMPTZ — the slot that was force-booked
  ├── slot_end              TIMESTAMPTZ — the slot that was force-booked
  ├── created_at            TIMESTAMPTZ
  └── updated_at            TIMESTAMPTZ
```

### How It Integrates with the Existing Constraint System

Your `slotComputationService.ts` already produces violation keys for every slot:

```typescript
// Existing violation keys your system already generates:
// Range:    'range.leadTime', 'range.dateRange'
// Overlap:  'overlap.event.direct', 'overlap.outOfOffice.direct',
//           'overlap.driveToCandidate.buffer:25', 'overlap.driveFromCandidate.buffer:20'
// Capacity: 'capacity.daily', 'capacity.calendarWeek', 'capacity.rollingWeek'
```

The force-create endpoint re-uses `computeSlotsForDateRange()` but changes the interpretation: instead of filtering to `isAvailable: true` slots only, it runs the computation, collects violations for the requested slot, and records them as the override.

The reschedule integration modifies `computeSlotsForDateRange()` to accept an optional `allowedExceptions: string[]` parameter. When present, any constraint whose violation key is in `allowedExceptions` is temporarily treated as `enforcement: 'off'` for that computation only. This requires no changes to the constraint data in the database — it's a per-request override at the computation layer.

### Key Implementation Detail: Slot Computation with Exceptions

The existing `computeSlotsForOneDay()` function checks constraints in sequence:

```typescript
// Existing flow in slotComputationService.ts (simplified):
// 1. checkRangeConstraints()   → passes/fails + violations
// 2. checkOverlapConstraints() → passes/fails + violations
// 3. checkCapacityConstraints() → passes/fails + violations
// Hard failures return isAvailable: false immediately.
```

For force-create, you need a variant that collects ALL violations without short-circuiting:

```typescript
// New function: computeViolationsForSlot()
// Runs all three constraint checks but never short-circuits on hard failures.
// Returns: { violations: string[], wouldBeAvailable: boolean }
//
// Used by:
//   - force-create endpoint: to record what was overridden
//   - admin UI: to show the admin exactly what they're overriding before confirming

interface ForceCreateViolationReport {
  violations: string[]
  wouldBeAvailable: boolean
  violationsByCategory: {
    range: string[]
    overlap: string[]
    capacity: string[]
  }
}
```

For reschedule with exceptions, you wrap the existing constraint arrays before passing them to `computeSlotsForDateRange()`:

```typescript
// Before calling computeSlotsForDateRange(), temporarily relax matching constraints:
//
// function relaxConstraintsForExceptions(
//   constraints: Constraint[],
//   allowedExceptions: string[]
// ): Constraint[]
//
// For each constraint, check if its violation key pattern matches an allowedExceptions entry.
// If so, clone the constraint with enforcement: 'off'.
// This is a pure function — original constraints are not mutated.
//
// Example:
//   allowedExceptions: ['capacity.daily', 'overlap.event.direct']
//   → daily capacity constraint cloned with enforcement: 'off'
//   → overlap constraints for regular events cloned with enforcement: 'off'
//   → all other constraints unchanged
```

### Checklist

#### Database & Model

- [ ] **8A.1** Create `constraint_overrides` migration
  - Table: `constraint_overrides`
  - Columns: `id` (UUID PK), `appointment_id` (FK → appointments, ON DELETE CASCADE), `overridden_violations` (TEXT ARRAY), `authorized_by_id` (FK → users), `reason` (TEXT, nullable), `slot_start` (TIMESTAMPTZ), `slot_end` (TIMESTAMPTZ), `created_at`, `updated_at`
  - Index on `appointment_id` (most lookups are "get overrides for this appointment")
- [ ] **8A.2** Create `ConstraintOverride` Sequelize model
  - File: `server/src/db/models/booking/constraint_override.ts`
  - Association: `Appointment.hasOne(ConstraintOverride)`, `ConstraintOverride.belongsTo(Appointment)`
  - Association: `ConstraintOverride.belongsTo(User, { as: 'authorizedBy' })`

#### Server: Force-Create Endpoint

- [ ] **8A.3** Create `computeViolationsForSlot()` in `slotComputationService.ts`
  - Re-uses existing `checkRangeConstraints()`, `checkOverlapConstraints()`, `checkCapacityConstraints()`
  - Never short-circuits on hard failures — collects all violations
  - Returns `ForceCreateViolationReport` with categorized violations
  - Pure function, no side effects
- [ ] **8A.4** Create force-create route: `POST /api/v1/internal/appointments/force-create`
  - File: `server/src/routes/internal/appointments/appointmentForceCreateRouter.ts`
  - Middleware: `requireAuth`, `requireRole('admin')`
  - Request body: same as normal appointment creation + `{ forceSlot: { startTime, endTime }, reason?: string }`
  - Calls `computeViolationsForSlot()` to determine what's being overridden
  - Creates appointment via existing `afterCreate` logic (snapshots, attendees, calendar event)
  - Creates `ConstraintOverride` record with violations, admin ID, reason
  - Response: `{ appointment, constraintOverride, violationReport }`
- [ ] **8A.5** Create force-create validator
  - File: `server/src/routes/internal/appointments/appointmentForceCreateValidator.ts`
  - Validate `forceSlot.startTime` and `forceSlot.endTime` are valid ISO timestamps
  - Validate `reason` is string if present (max 500 chars)
  - Validate all normal appointment fields
- [ ] **8A.6** Mount force-create router in `appointmentRouter.ts`
  - `router.use('/', AppointmentForceCreateRouter)`

#### Server: Reschedule with Exceptions

- [ ] **8A.7** Create `relaxConstraintsForExceptions()` utility
  - File: `server/src/utils/availabilities/constraintRelaxation.ts`
  - Pure function: `(constraints: Constraint[], allowedExceptions: string[]) => Constraint[]`
  - Clones matching constraints with `enforcement: 'off'` — does not mutate originals
  - Matching logic: violation key prefix match (e.g., `'capacity.daily'` matches any `capacity.daily` violation; `'overlap.event.direct'` matches that exact violation)
- [ ] **8A.8** Extend `computeAvailabilityData()` to accept optional `allowedExceptions`
  - Add optional parameter: `allowedExceptions?: string[]`
  - When present, call `relaxConstraintsForExceptions()` before passing constraints to `computeSlotsForDateRange()`
  - Update `availabilityRouter.ts` POST body to accept `allowedExceptions` (only when `appointmentId` is also provided — server verifies the appointment has a matching override record)
- [ ] **8A.9** Add server-side authorization check for exception usage
  - When `allowedExceptions` is passed in the availability request, the server must verify:
    1. The `appointmentId` exists
    2. The appointment has a `ConstraintOverride` record
    3. The requested `allowedExceptions` are a subset of `overridden_violations` from that record
  - Reject if the client tries to pass exceptions that weren't in the original override
  - This prevents a client from fabricating arbitrary exceptions

#### Client: Admin Force-Create UI

- [ ] **8A.10** Create `useForceCreateAppointment` composable
  - File: `client/src/composables/admin/useForceCreateAppointment.ts`
  - Calls the force-create endpoint
  - Manages: violation preview state, confirmation flow, reason input
  - Returns: `{ violations, isLoading, forceCreate, previewViolations }`
- [ ] **8A.11** Create force-create confirmation dialog
  - Shows the admin exactly which constraints will be overridden
  - Groups violations by category (range, overlap, capacity) with human-readable labels
  - Requires explicit confirmation ("I understand this appointment bypasses X constraints")
  - Optional reason field (free text)
  - Violation label mapping:

```typescript
// Human-readable violation labels for the confirmation dialog
const VIOLATION_LABELS: Record<string, string> = {
  'range.leadTime': 'Lead time requirement (slot is too soon)',
  'range.dateRange': 'Outside allowed date range',
  'overlap.event.direct': 'Conflicts with existing calendar event',
  'overlap.outOfOffice.direct': 'Conflicts with out-of-office event',
  'overlap.driveToCandidate.buffer': 'Insufficient drive time to appointment',
  'overlap.driveFromCandidate.buffer': 'Insufficient drive time from previous appointment',
  'capacity.daily': 'Exceeds daily work hour limit',
  'capacity.calendarWeek': 'Exceeds weekly work hour limit',
  'capacity.rollingWeek': 'Exceeds rolling week work hour limit',
}

// Drive time violations include minutes — extract for display:
// 'overlap.driveToCandidate.buffer:25' → 'Insufficient drive time to appointment (25 min)'
```

- [ ] **8A.12** Add "Force Schedule" button to admin appointments UI
  - Only visible to admin role users
  - Located in appointments table toolbar or as a standalone action
  - Opens a simplified booking flow (date/time picker + service selection)
  - Shows blocked slots in a distinct color (red/orange) but makes them selectable
  - Clicking a blocked slot triggers the violation preview + confirmation dialog

#### Client: Reschedule Integration

- [ ] **8A.13** Extend reschedule flow to check for existing overrides
  - When rescheduling an appointment, fetch its `ConstraintOverride` record (if any)
  - Pass `allowedExceptions` from the override to the availability computation request
  - In the availability calendar, slots that would be blocked but are allowed by the exception should show with a distinct visual indicator (e.g., amber/yellow instead of green, with a tooltip explaining "Available via admin override")
- [ ] **8A.14** Create override record for rescheduled appointment
  - When a reschedule completes, create a new `ConstraintOverride` record for the new slot
  - Link to the same `authorized_by_id` as the original override (or to the current admin if an admin is doing the reschedule)
  - New violations may differ from the original (different slot = different conflicts)

### Violation Key Reference

These are the violation keys your constraint system already produces. The `overridden_violations` column stores these exact strings:

| Constraint Category | Violation Key Pattern | Example | Source Function |
|---|---|---|---|
| Range | `range.leadTime` | Slot starts before lead time window | `checkOneRangeConstraint()` |
| Range | `range.dateRange` | Slot outside allowed date boundaries | `checkOneRangeConstraint()` |
| Overlap | `overlap.event.direct` | Slot overlaps a calendar event | `getOverlapViolationsForEvent()` |
| Overlap | `overlap.outOfOffice.direct` | Slot overlaps out-of-office event | `getOverlapViolationsForEvent()` |
| Overlap | `overlap.driveToCandidate.buffer:N` | Slot within N-minute drive-to buffer | `getOverlapViolationsForEvent()` |
| Overlap | `overlap.driveFromCandidate.buffer:N` | Slot within N-minute drive-from buffer | `getOverlapViolationsForEvent()` |
| Capacity | `capacity.daily` | Exceeds max daily work hours | `checkOneCapacityConstraint()` |
| Capacity | `capacity.calendarWeek` | Exceeds max calendar week hours | `checkOneCapacityConstraint()` |
| Capacity | `capacity.rollingWeek` | Exceeds max rolling week hours | `checkOneCapacityConstraint()` |

### Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Override storage | Separate `constraint_overrides` table | Keeps appointment model clean; one appointment may have zero or one override; CASCADE delete keeps data consistent |
| Violation recording | Store exact violation key strings | Re-uses existing violation key system from `slotComputationService.ts`; no new enum or mapping needed |
| Reschedule exception passing | Server-side verification | Client sends `allowedExceptions` + `appointmentId`; server verifies the exceptions match the override record. Prevents fabricated exceptions. |
| Constraint relaxation approach | Clone constraints with `enforcement: 'off'` | Pure function, no mutation of DB-sourced constraints, no changes to `extractConstraints()` or `AvailabilitySettingsData` |
| Admin UI approach | Show all slots (blocked = distinct color) | Admin needs to see what they're overriding; hiding blocked slots defeats the purpose |
| Reason field | Optional free-text | Low friction for quick overrides; available for audit trail when needed |

---

## Ordered Todo List

This is the implementation order. Work through these sequentially (some can be parallelized as noted). Each item maps to a checklist item above.

**Time estimate key:** `1h` = ~1 hour, `½d` = half day (~4 hours), `1d` = full day (~8 hours), `2d` = two days.

**Dependency notation:** Items marked **Blocked by: #X** cannot start until item X is complete.

### Priority 0: Merge & Sanity Check (Gate: codebase is deployable)

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 0 | Verify CI passes on feature branch | 0.1 | 1h | — | Run lint, typecheck, test locally; fix any failures |
| 1 | Merge `feature/google-apis-integration` → `main` | 0.2 | ½h | #0 | Create PR, verify CI on PR, merge |
| 2 | Verify production build succeeds locally | 0.3–0.4 | 1h | #1 | `client:build`, `build:prod`, preview `client/dist/` |
| 3 | Verify PORT handling + API URL configuration | 0.5–0.6 | 1h | #1 | Confirm server reads dynamic PORT; confirm client uses `VITE_API_BASE_URL` |

**Alpha Gate Check:** After #3, the codebase builds and runs cleanly. If it doesn't, stop and fix before proceeding.

### Priority 1: Foundation (Gate: Alpha Ready — app deployed, auth working)

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 4 | Create test suite feature docs in `.project-manager/` | 3.1 | 1h | — | Sets up tracking for test work |
| 5 | Create Render account, connect GitHub repo | 1.1 | ½h | #1 | Manual step — do in browser |
| 6 | Create Render PostgreSQL database | 1.2 | ½h | #5 | Record connection string for env vars |
| 7 | Update CORS to whitelist specific origins | 1.6 / 2.2 | 1h | — | Code change in `server/src/app.ts` |
| 8 | Add health check endpoint | 5.1 | 1h | — | New route in Express; Render uses for monitoring |
| 9 | **Auth: DB migration + models** (sessions, magic_links) | 2A.1–2A.3 | ½d | — | Foundation for all auth |
| 10 | **Auth: Strategy interface + session manager + config** | 2A.4–2A.6 | ½d | #9 | Shared infra + env routing + session cleanup interval |
| 11 | **Auth: `requireAuth` middleware + role checks** | 2A.7 | ½d | #10 | Replaces existing no-op stubs |
| 12 | **Auth: Email service + Magic Link strategy** | 2A.8–2A.9 | ½d | #10 | Beta login flow (server side) |
| 13 | **Auth: Auth router + mount + cookie-parser** | 2A.10–2A.12 | 1h | #11, #12 | Wire auth into Express app |
| 14 | **Auth: Pinia auth store** | 2A.13 | ½d | #13 | Client-side session state |
| 15 | **Auth: AuthView + MagicLinkForm + VerifyView** | 2A.14–2A.16 | ½d | #14 | Client-side login UI |
| 16 | **Auth: Vue Router guards + app startup init** | 2A.17–2A.18 | 1h | #14, #15 | Protect routes, check session on load |
| 17 | Add API rate limiting for internal routes | 2.3 | 1h | — | Install `express-rate-limit`, configure |
| 18 | Configure production environment variables | 5.6 | 1h | #6 | Set in Render dashboard (incl. auth + Google OAuth vars) |
| 19 | Update Google OAuth redirect URI | 1.8 | ½h | #18 | Add Render API URL to Google Cloud Console |
| 20 | Create Render Web Service (Express API) | 1.3 | ½d | #6, #7, #8, #18 | Configure build/start commands, env vars |
| 21 | Create Render Static Site (Vue client) | 1.4 | ½d | #3, #20 | Configure build, publish dir, SPA rewrite, `VITE_API_BASE_URL` |
| 22 | Run migrations + seed on Render PostgreSQL | 1.7 | 1h | #20 | One-time setup via Render Shell (incl. auth tables) |
| 23 | Verify end-to-end in hosted environment | 1.9 | ½d | #21, #22 | Manual testing — static site → API → DB → auth → calendar |

**Alpha Gate Check:** After #23, the app is deployed and working. You can access it from a browser, log in via magic link (console email in dev, real email in hosted), navigate the booking wizard, and use the admin panel. This is "Alpha Ready."

### Priority 2: Testing Infrastructure (Gate: Beta Ready — tests cover critical paths)

E2E tests come first because they validate "does the product work for a user?" Mutation testing and property-based testing come after, validating "are our existing unit tests thorough?"

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 23a | Turn test audits back on (before testing build) | 3.0a | ½h | — | Set `testsDisabled` false in `audit-global-config.json`; ensure audit:test + coverage-risk run; do before #24 |
| 24 | Audit existing test coverage | 3.2 | 1h | — | Run coverage reports, identify gaps |
| 25 | Define coverage targets | 3.3 | ½h | #24 | Decision + document |
| 26 | Expand CI branch triggers | 4.1 | ½h | — | Update `.github/workflows/ci.yml` to trigger on all branches |
| 27 | Set up Playwright for E2E testing | 3.4 | ½d | — | Install, configure, create base fixtures |
| 28 | Write E2E tests: booking flow | 3.5 | 1d | #27 | Critical path: user type → service → availability → confirm |
| 29 | Write E2E tests: auth flow | 3.5 | ½d | #27 | **Blocked by: #16** (auth must exist). Magic link → verify → session |
| 30 | Write E2E tests: admin panel | 3.6 | 1d | #27, #29 | CRUD on shapes/instances, relationship management |
| 31 | Expand server integration tests | 3.7 | 1d | — | Route lifecycle, mocked external APIs, error paths |
| 32 | Add E2E testing job to CI | 3.8 | ½d | #28 | Playwright in GitHub Actions, upload artifacts on failure |
| 33 | Add test coverage reporting to CI | 3.9 | 1h | — | Coverage summary on PRs |
| 34 | Install Stryker Mutator + create config | 3A.1–3A.3 | 1h | — | Mutation testing setup |
| 35 | Run Stryker on transformer primitives (quick win) | 3A.4 | 1h | #34 | Pure functions, fast feedback loop |
| 36 | Run Stryker on booking composables | 3A.5 | ½d | #34 | Critical business logic mutation analysis |
| 37 | Fix surviving mutants (strengthen assertions) | 3A.6 | 1d | #36 | Improve test quality based on Stryker report |
| 38 | Define mutation score targets | 3A.7 | ½h | #36 | Decision + document thresholds |
| 39 | Install fast-check + property tests for primitives | 3A.9–3A.10 | ½d | — | Invariant verification for transformers |
| 40 | Property tests for booking utilities | 3A.11 | ½d | #39 | Fee calc + duration rounding invariants |
| 41 | Create + run behavioral alignment audit | 3A.12–3A.14 | ½d | — | Custom audit script following existing pattern |
| 42 | Strengthen Grade D/C test files | 3A.15 | 1d | #41 | Fix weakest tests identified by audit |
| 43 | Add mutation testing to CI (non-blocking) | 3A.16 | 1h | #34 | Quality gate on PRs, not blocking initially |
| 44 | Create test quality dashboard | 3A.17 | 1h | #41 | Unified summary script for all quality layers |

### Priority 3: Production Hardening (Complete before public beta)

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 45 | Set up Sentry error tracking | 5.2 | ½d | — | Server (`@sentry/node`) + client (`@sentry/vue`) |
| 46 | Set up database backups | 5.4 | 1h | — | Depends on Render tier (Starter includes daily backups) |
| 47 | Set up uptime monitoring | 5.5 | 1h | #8 | **Blocked by: #8** (health endpoint). UptimeRobot or similar |
| 48 | Create `render.yaml` Blueprint | 1.10 | ½d | #20, #21 | Infrastructure as Code — reproducible deploys |
| 49 | Add staging deployment job to CI | 4.2 | ½d | #48 | Auto-deploy on merge to main via Render deploy hook |
| 50 | Add deployment verification to CI | 4.3 | 1h | #49 | Health check against staging URL after deploy |
| 51 | Configure production logging | 5.3 | 1h | — | Verify log levels, add request IDs |
| 52 | Document + test rollback procedures | 5.7–5.8 | ½d | #22 | Test migration undo locally; document full rollback procedure |
| 53 | Audit input validation on all routes | 2.4 | 1d | — | Joi schemas for all POST/PUT endpoints |
| 54 | Security audit: secrets in code | 2.5 | 1h | — | Verify .gitignore, scan for hardcoded credentials |

### Priority 4: Polish & Guided Testing (Gate: Beta Ready — testers can be invited)

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 55 | Verify beta feedback in production | 6.1 | 1h | #23 | **Blocked by: #23** (deployed env). Submit feedback → verify in admin |
| 56 | Add Vue error boundary | 6.2 | ½d | — | Graceful fallback UI when component crashes |
| 57 | Review loading/error states | 6.3 | 1d | — | Across all views: spinners, error messages, retry buttons |
| 58 | Cross-browser/device testing | 6.4 | 1d | #23 | Desktop (Chrome/Firefox/Safari) + mobile (iOS/Android) |
| 59 | Update README.md | 6.5 | 1h | — | Deployment instructions + architecture overview |
| 60 | **Guided testing: DB migration + models** | 6A.1–6A.2 | ½d | **#16** | **Blocked by: #16** (auth). Tasks, assignments, addresses tables |
| 61 | **Guided testing: Seed tasks + addresses** | 6A.3–6A.4 | ½d | #60 | ~25 tasks across 15 feature areas, 5–8 curated addresses |
| 62 | **Guided testing: Assignment algorithm** | 6A.5 | ½d | #60 | Weighted random: coverage priority + variety + difficulty mix |
| 63 | **Guided testing: API router + validation** | 6A.6–6A.7 | ½d | #62 | My-tasks, status updates, admin CRUD, coverage stats |
| 64 | **Guided testing: `useBetaTesting` composable** | 6A.8 | 1h | #63 | Client-side API integration |
| 65 | **Guided testing: `BetaTestingGuide.vue` panel** | 6A.9–6A.10 | 1d | #64 | Floating panel + task items with expand/feedback |
| 66 | **Guided testing: Feedback linkage** | 6A.11 | ½d | #65 | Pre-fill feedback modal from task context |
| 67 | **Guided testing: Coverage dashboard** | 6A.12 | 1d | #63 | Admin view: heatmap, per-task/per-tester tables |
| 68 | **Guided testing: Mount + route** | 6A.13–6A.14 | 1h | #65 | Add to app layout + admin route |
| 69 | Create alpha tester onboarding guide (static fallback) | 6.6 | 1h | — | For testers who prefer a document over in-app guide |

**Beta Gate Check:** After #69, the app has E2E test coverage, error tracking, auth, and a guided testing system with seeded tasks. You can invite 5–10 trusted testers who will receive personalized task lists and can submit structured feedback.

### Priority 5: Production Auth Transition (When graduating from beta)

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 70 | **Auth: Create `login` table migration** | 2A.19 | 1h | — | email + password_hash, FK to users |
| 71 | **Auth: Implement PasswordStrategy** | 2A.20 | 1d | #70 | register, login, forgot/reset password |
| 72 | **Auth: Create PasswordLoginForm.vue** | 2A.21 | ½d | #71 | Email + password UI |
| 73 | **Auth: Flip strategy in authConfig.ts** | 2A.22 | ½h | #71 | Uncomment one line or set `AUTH_STRATEGY` env var |
| 74 | **Auth: Migrate beta users** | — | ½d | #73 | Existing magic-link users prompted to set password on first login |

### Optional / Post-Launch

| # | Item | Phase | Time | Deps | Notes |
|---|------|-------|------|------|-------|
| 75 | Configure custom domain | 1.11 | 1h | — | DNS + SSL |
| 76 | Vite `base` option for subdirectory | 1.5 | ½h | — | Only if using subdirectory hosting |
| 77 | Preview deployments for PRs | 4.5 | ½d | — | Render preview environments |
| 78 | CI caching optimization | 4.6 | 1h | — | Faster build times |
| 79 | Pre-commit hooks (husky) | 3.10 | 1h | — | Lint + typecheck on commit |
| 80 | Security headers review (CSP) | 2.6 | 1h | — | Content-Security-Policy |
| 81 | CSRF protection | 2.7 | ½d | — | Recommended for cookie-based session auth |
| 82 | **Bright MLS API credentials** | Post-Beta | 1h | — | Provider requires beta launch before issuing credentials |
| 83 | **Capacitor: Install + init** | 7.1 | 1h | #23 | `@capacitor/core`, `@capacitor/cli`, `capacitor.config.ts` |
| 84 | **Capacitor: Add iOS platform** | 7.2 | 1h | #83 | `npx cap add ios`, verify in Xcode simulator |
| 85 | **Capacitor: Add Android platform** | 7.3 | 1h | #83 | `npx cap add android`, verify in Android emulator |
| 86 | **Capacitor: Configure production API** | 7.4 | 1h | #83 | Native app connects to Render API, not localhost |
| 87 | **PWA: manifest + service worker** | 7.5 | ½d | #23 | `vite-plugin-pwa`, offline caching, Add to Home Screen |
| 88 | **Capacitor: Icons + splash screens** | 7.6 | ½d | #84, #85 | iOS 1024x1024, Android 512x512, splash screen plugin |
| 89 | **Capacitor: Permissions + plugins** | 7.7 | 1h | #84, #85 | Start minimal — only add as features require |
| 90 | **Capacitor: Build pipeline sync** | 7.8 | 1h | #83 | `cap:sync` + `cap:build` npm scripts, `.gitignore` update |
| 91 | **Capacitor: E2E native testing** | 7.9 | 1d | #84, #85, #86 | Booking + admin flows on iOS sim + Android emulator |
| 92 | **App Store / Play Store prep** | 7.10 | ½d | #91 | Developer accounts, metadata, screenshots (can defer) |
| 93 | **Ionic: Evaluate conversion need** | 7.11 | — | Beta feedback | Decision gate — only proceed if mobile-native UX needed |
| 94 | **Ionic: Install alongside Vuetify** | 7.12 | ½d | #93, Feature 13 | `@ionic/vue`, verify CSS coexistence |
| 95 | **Ionic: Booking wizard shell** | 7.13 | 1d | #94 | IonPage/IonContent routing for booking flow |
| 96 | **Ionic: Convert booking components** | 7.14 | 2–3d | #95 | Template-only changes, composable logic untouched |
| 97 | **Ionic: Hybrid testing** | 7.15 | 1d | #96 | Vuetify admin + Ionic booking coexistence |
| 98 | **Ionic: Bundle optimization** | 7.16 | ½d | #97 | Tree-shaking, code-splitting, size audit |
| 99 | **Force-create: DB migration + model** | 8A.1–8A.2 | ½d | **#16** | `constraint_overrides` table + Sequelize model. **Blocked by: #16** (auth) |
| 100 | **Force-create: `computeViolationsForSlot()`** | 8A.3 | ½d | — | Non-short-circuiting variant of slot constraint checking |
| 101 | **Force-create: API endpoint + validator** | 8A.4–8A.5 | 1d | #99, #100 | `POST /appointments/force-create`, requireRole('admin') |
| 102 | **Force-create: Mount router** | 8A.6 | ½h | #101 | Wire into `appointmentRouter.ts` |
| 103 | **Force-create: `relaxConstraintsForExceptions()`** | 8A.7 | ½d | — | Pure function to clone constraints with enforcement:'off' |
| 104 | **Force-create: Extend availability endpoint** | 8A.8 | ½d | #99, #103 | Accept `allowedExceptions` + `appointmentId` in POST body |
| 105 | **Force-create: Server-side exception auth** | 8A.9 | ½d | #104 | Verify exceptions are subset of stored override record |
| 106 | **Force-create: `useForceCreateAppointment` composable** | 8A.10 | ½d | #101 | Client-side API integration + violation preview state |
| 107 | **Force-create: Confirmation dialog** | 8A.11 | 1d | #106 | Violation preview, category grouping, reason field, explicit confirm |
| 108 | **Force-create: Admin UI "Force Schedule" button** | 8A.12 | 1d | #107 | Blocked slots shown in distinct color, selectable by admin |
| 109 | **Force-create: Reschedule override fetch** | 8A.13 | ½d | #104 | Fetch override for appointment, pass exceptions to availability |
| 110 | **Force-create: Reschedule override creation** | 8A.14 | ½d | #109 | New override record for rescheduled appointment |

### Time Estimate Summary

| Priority | Items | Estimated Time | Gate |
|----------|-------|---------------|------|
| P0: Merge & Sanity | #0–3 | ~½ day | Codebase deployable |
| P1: Foundation | #4–23 | ~8–10 days | **Alpha Ready** |
| P2: Testing | #24–44 | ~10–12 days | Tests cover critical paths |
| P3: Hardening | #45–54 | ~4–5 days | Production-grade ops |
| P4: Polish + Guided Testing | #55–69 | ~8–10 days | **Beta Ready** |
| P5: Production Auth | #70–74 | ~3 days | Production Ready |
| P6: Native App (Capacitor) | #83–92 | ~3–4 days | App in stores |
| P7: Ionic Conversion (optional) | #93–98 | ~5–7 days | Native mobile UX |
| P8: Force-Create & Overrides | #99–110 | ~5–7 days | Admin override capability |
| **Total to Beta Ready** | **#0–69** | **~30–37 days** | |

These are rough estimates for a solo developer learning as you go. Actual time may vary — some items will go faster than expected, others will surface surprises. The estimates help with sprint planning, not with deadlines.

---

## Progress Tracker

**Started:** 2026-02-18
**Target Alpha:** TBD (estimated: ~2 weeks after starting P1)
**Target Beta:** TBD (estimated: ~6–8 weeks after starting P1)

| Phase | Status | Items Done | Items Total |
|-------|--------|------------|-------------|
| 0. Merge & Sanity Check | Not Started | 0 | 6 |
| 1. Hosting & Deployment | Not Started | 0 | 11 |
| 2. Security Hardening | Not Started | 0 | 7 |
| 2A. Authentication & User Identity | Not Started | 0 | 22 |
| 3. Test Suite Setup | Not Started | 0 | 10 |
| 3A. Test Quality Validation | Not Started | 0 | 17 |
| 4. CI/CD Enhancement | Not Started | 0 | 6 |
| 5. Production Readiness | Not Started | 0 | 8 |
| 6. Pre-Launch Polish | Not Started | 0 | 6 |
| 6A. Beta Tester Onboarding & Guided Testing | Not Started | 0 | 14 |
| 7. Native App Shell — Stage 1 (Capacitor) | Not Started | 0 | 10 |
| 7. Native App Shell — Stage 2 (Ionic) | Not Started | 0 | 6 |
| 8A. Admin Force-Create & Blocker Exceptions | Not Started | 0 | 14 |
| **Total** | | **0** | **137** |

**Notes:**
- Phase 2A items 2A.19–2A.22 (Password Strategy) are deferred to production transition.
- Phase 6A items depend on Phase 2A (authentication) — cannot start until auth is deployed.
- Phase 7 Stage 1 (Capacitor) can begin any time after the app is deployed (Phase 1 complete).
- Phase 7 Stage 2 (Ionic) is planned between Alpha Ready and Beta Ready (see "Between Alpha and Beta"). Depends on Feature 17 (Admin UI Overhaul) completing first. Optional: still evaluate after alpha whether Ionic is warranted; default plan is to proceed for the Apple Store version.
- Phase 8A (Force-Create & Overrides) depends on Phase 2A (authentication) — needs `req.user` to record who authorized the override. Connects to Feature 8 Phase 8.4 (Rescheduling Flow).
- Priority numbering (#0–82) is the implementation sequence. Phase numbering (0.1, 2A.7, etc.) maps to the detailed checklist sections above.

---

## Appendix A: Render-Specific Configuration Reference

### render.yaml Blueprint (Template)

```yaml
# render.yaml — Infrastructure as Code for Render deployment
# Place in repository root. Render auto-detects and offers to create services.

databases:
  - name: scheduler-db
    plan: starter  # or free (expires 90 days)
    databaseName: scheduler_db
    user: scheduler_user

services:
  - type: web
    name: scheduler-api
    runtime: node
    plan: starter  # or free
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: node dist/server/src/index.js
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        fromDatabase:
          name: scheduler-db
          property: host
      - key: DB_NAME
        fromDatabase:
          name: scheduler-db
          property: database
      - key: DB_USER
        fromDatabase:
          name: scheduler-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: scheduler-db
          property: password
      - key: DB_PORT
        fromDatabase:
          name: scheduler-db
          property: port
      - key: PORT
        value: 3001
      - key: CORS_ORIGIN
        sync: false  # set manually per environment
      - key: CLIENT_URL
        sync: false  # set to static site URL (for magic link redirect URLs)
      - key: AUTH_STRATEGY
        value: magic_link  # or 'password' for production
      - key: RESEND_API_KEY
        sync: false  # set when email provider is configured

  - type: web
    name: scheduler-client
    runtime: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_BASE_URL
        sync: false  # set to API service URL
```

### Environment Variables Needed

| Variable | Service | Description |
|----------|---------|-------------|
| `NODE_ENV` | API | `production` |
| `PORT` | API | Port for Express (Render assigns dynamically, use `process.env.PORT`) |
| `DB_HOST` | API | PostgreSQL host (from Render DB) |
| `DB_NAME` | API | Database name |
| `DB_USER` | API | Database user |
| `DB_PASSWORD` | API | Database password |
| `DB_PORT` | API | PostgreSQL port (usually 5432) |
| `CORS_ORIGIN` | API | Allowed origin(s) for CORS |
| `GOOGLE_CLIENT_ID` | API | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | API | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | API | OAuth callback URL (must match Render API URL) |
| `CLIENT_URL` | API | Full URL to the client static site (for magic link redirect URLs) |
| `AUTH_STRATEGY` | API | `magic_link` (beta) or `password` (production) — overrides `NODE_ENV` default |
| `RESEND_API_KEY` | API | Resend email provider API key (for magic link emails) |
| `VITE_API_BASE_URL` | Client | Full URL to the API service |

---

## Appendix B: Feature Development vs Launch Infrastructure

This checklist (LAUNCH_CHECKLIST.md) tracks **launch infrastructure**. The following feature work is tracked separately in `.project-manager/PROJECT_PLAN.md` and may or may not be required for alpha launch:

| Feature | Actual Status (2026-02-18) | Required for Alpha? | Notes |
|---------|---------------------------|---------------------|-------|
| Feature 0: Vue Migration | **Complete** | N/A | Structural migration done. All remaining work is feature development. |
| Feature 1: Data Flow Alignment | **Complete** | N/A | Phases 1.1–1.5 all done. Branch merged to main. Completion summary at `.project-manager/features/data-flow-alignment/feature-completion-summary.md` |
| Feature 2: Google APIs Integration | **In Progress** | **Partial** | Phase 2.0 (Calendar Config UI) complete. Phase 2.1 (Calendar API) complete. Phase 2.2 (Maps API) in progress (sessions 2.2.1–2.2.4+ done). Phase 2.3 (MLS) infrastructure done, credentials pending beta launch. |
| Feature 5: Property Enrichment & Mappings | **Complete** | **Post-Beta** | Transformer, mappings, admin UI, client integration all built. Bright MLS API credentials not yet connected — provider requires beta launch before issuing access. |
| Feature 6: Appointment Workflow & Booking Calculations | **Partial** | **Assess** | Fee/time calcs and workflow Phase 1 done. Phase 6.7 (Force-Create) in PROJECT_PLAN. |
| Feature 3: Calendar & Appointment Availability | **Complete** | N/A | Server-side slot computation and calendar UI for booking flow. |
| Feature 18: Admin Assistance Wizard | **Planning** | No | Post-launch enhancement (deterministic guided workflows). |
| Feature 16: UI Polish | **Planning** | **Partial** | "Good enough" for alpha, polish for beta. |
| Feature 13: Beta Feedback System | **Complete** | Already built | Full system: model, API, UI widget, admin dashboard. |
| Feature 4: Pricing Cascades | **Complete** | Already built | Server models, admin UI, booking fee flow. |
| Feature 11: Pre-Launch Polish | **Planning** | Before beta | Error boundary, loading/error review, cross-browser testing, README, onboarding guide. |
| Feature 12: Alpha Launch & Deployment | **Planning** | **Yes** | Merge/sanity, Render setup, render.yaml. Alpha milestone. |
| **Auth: Magic Link (Beta)** | **Phase 2A** | **Yes** | Collects user emails, enables role-based access, auto-populate |
| **Auth: Password (Production)** | **Phase 2A** | No | Deferred to production transition (items 2A.19–2A.22) |
| **Native App (Capacitor)** | **Phase 7 Stage 1** | No | Post-beta. Wraps existing SPA as iOS/Android app. Zero component changes. |
| **Ionic Booking Conversion** | **Phase 7 Stage 2** | No | Post Admin UI Overhaul (Feature 17). Decision gate — only if mobile-native UX needed per beta feedback. |
| **Admin Force-Create & Overrides** | **Phase 8A** | No | Post-auth admin power tool. Force-create appointments bypassing blockers; exceptions honored on reschedule. |

**Action Item:** Before starting Priority 1, review PROJECT_PLAN.md features and decide which are alpha-blocking. This table is aligned with PROJECT_PLAN feature numbering (0–18) as of checklist reconciliation.

### Property Details Step — Planned UX Improvements (Post-Enrichment)

When Bright MLS credentials are connected and enrichment returns live data, the following UI/UX changes should be considered for the Property Details step (`PropertyDetailsStep.vue`):

#### Property Type Selection Cards

**Current:** Property type cards (Single Family, Townhouse, etc.) always render at the top when available. Enrichment can auto-select a suggested type via `suggestedBlockInstanceIds`.

**Planned improvements:**
- **Progressive disclosure:** When enrichment successfully suggests a property type, show a compact inline summary (e.g. "Detected: Single Family Home [Change]") instead of the full card grid. Cards add visual clutter when enrichment already selected.
- **Fallback to full cards:** When enrichment fails (404, 503, no credentials) or autocomplete fails (manual address entry, no placeId), show the full property type card grid. User must select manually.
- **Override path:** Always allow the user to click "Change" and expand to full card selection if they disagree with the enrichment suggestion (e.g. MLS says Single Family but property is Townhouse with ADU).

#### Enrichment Data Display

**Current:** Enrichment data (MLS Number, Bedrooms, Bathrooms, Foundation Access, square footage) appears in the Details section on the page and is repeated in the confirmation modal.

**Planned improvements:**
- **Keep enrichment visible on the page:** Users should see and verify enrichment data immediately, not only in the confirmation modal. Hiding it would force a round-trip to edit.
- **Source attribution:** Add a "From MLS" or "From listing" badge near enriched fields so users know the data source and can trust or override it.
- **Grouping:** Consider a collapsible "MLS Information" block or card to keep the form scannable while clearly grouping enrichment fields.
- **Editability:** All enriched fields remain editable; enrichment is a suggestion, not final. No locking.

#### Other UX Considerations

| Consideration | Recommendation |
|---------------|----------------|
| **Loading state** | Skeleton or placeholder for Details section while `isEnrichmentLoading`; avoid empty fields flashing. |
| **Partial enrichment** | If enrichment returns only some fields (e.g. square footage but no bedrooms), show only populated fields; do not render empty MLS fields. |
| **Override / undo** | Consider a "Clear MLS data" or "Enter manually" action so users can discard enrichment and start from scratch. |
| **Section order** | Keep Location first; optionally move property type below Location when it is derived from enrichment to reinforce "address → type" flow. |
| **Confirmation modal** | Ensure modal includes property type and enrichment-derived fields in the summary. Modal remains the final "confirm before proceeding" step. |
| **Validation** | When enrichment auto-selects a property type, ensure validation treats it as valid; user should not need to click cards to satisfy `hasPropertyTypeBlock`. |
| **Mobile** | Property type cards and MLS block should remain responsive (stacking, touch targets). |

#### Implementation Notes

- Logic: `showPropertyTypeCards = !hasEnrichmentPropertyType || userClickedChange`
- `hasEnrichmentPropertyType` = enrichment returned `suggestedBlockInstanceIds` that matched an `availablePropertyTypeBlock` and was auto-selected.
- Document in `.project-manager/features/` or Feature 9 docs when implementing.

---

## Appendix C: Test Suite Architecture Reference

### Existing Test Infrastructure

| Layer | Tool | Location | Count | Coverage |
|-------|------|----------|-------|----------|
| Client Unit | Vitest | `client/src/**/*.test.ts` | 117 files | Thresholds: 80% branch, 90% func/line/stmt |
| Server Unit | Jest | `server/src/**/*.test.ts` | 15 files | Thresholds: 80% branch, 90% func/line/stmt |
| E2E | None | — | 0 | — |
| Static Analysis | TypeScript + ESLint | CI pipeline | N/A | Strict mode enabled |

### Test Quality Validation Infrastructure (Phase 3A)

| Layer | Tool | Location | Purpose |
|-------|------|----------|---------|
| Mutation Testing | Stryker Mutator | `client/stryker.config.mjs` | Verifies tests catch real bugs by introducing deliberate mutations |
| Property-Based Testing | fast-check | `client/src/**/*.property.test.ts` | Verifies invariants hold for random inputs |
| Behavioral Alignment | Custom audit script | `client/.scripts/test-alignment-audit.mjs` | Scores test files on behavioral vs structural testing |
| Quality Dashboard | Custom script | `client/.scripts/test-quality-dashboard.mjs` | Unified summary of all quality layers |

### Test Quality File Naming Convention

```
client/src/
  composables/booking/__tests__/
    useWizardFilteredOptions.test.ts            ← Example-based unit tests (existing)
    useWizardFilteredOptions.property.test.ts   ← Property-based invariant tests (new)
  utils/transformers/__tests__/
    transformerPrimitives.test.ts               ← Example-based unit tests (existing)
    transformerPrimitives.property.test.ts      ← Property-based invariant tests (new)
  utils/booking/__tests__/
    bookingUtils.property.test.ts               ← Property-based tests for booking calcs (new)
```

### Test Quality Reports

```
client/
  .mutation-reports/
    mutation-report.html    ← Stryker HTML report (gitignored)
  .audit-reports/
    test-alignment-audit.json        ← Machine-readable alignment audit
    test-alignment-audit-summary.md  ← Human-readable alignment audit
```

### NPM Scripts Reference (Test Quality)

| Script | Command | Description |
|--------|---------|-------------|
| `test:mutate` | `stryker run` | Full mutation test run |
| `test:mutate:booking` | `stryker run --mutate '...'` | Scoped to booking composables |
| `test:mutate:transformers` | `stryker run --mutate '...'` | Scoped to transformer utilities |
| `test:mutate:utils` | `stryker run --mutate '...'` | Scoped to booking utilities |
| `audit:test-alignment` | `node .scripts/test-alignment-audit.mjs` | Run behavioral alignment audit |
| `test:quality` | `node .scripts/test-quality-dashboard.mjs` | Unified quality dashboard |

### Relationship Between Quality Layers

```
Code Coverage          "Was this line executed during tests?"
  ↓ (necessary but not sufficient)
Mutation Score         "Would tests catch a bug on this line?"
  ↓ (complementary)
Property-Based Tests   "Do invariants hold for inputs I never considered?"
  ↓ (complementary)
Alignment Audit        "Are test names and assertions behavior-focused?"
```

Each layer catches different problems:
- **Coverage** finds untested code paths (but can't tell if tested paths are verified)
- **Mutation score** finds assertions that are too weak (tests run the code but don't check results)
- **Property-based tests** find edge cases in pure functions (inputs you'd never think to try manually)
- **Alignment audit** finds structural/existential tests (tests that check "does it exist" not "does it work")

### Proposed E2E Test Structure

```
e2e/                          (or tests/e2e/)
├── playwright.config.ts      Configuration
├── fixtures/                 Test fixtures and helpers
│   ├── base.ts               Base test fixture
│   └── auth.ts               Authenticated user fixture
├── booking/                  Booking wizard E2E tests
│   ├── happy-path.spec.ts    Complete booking flow
│   ├── validation.spec.ts    Form validation errors
│   └── responsive.spec.ts    Mobile viewport tests
├── admin/                    Admin panel E2E tests
│   ├── shapes-crud.spec.ts   Shape entity CRUD
│   ├── instances-crud.spec.ts Instance entity CRUD
│   └── relationships.spec.ts Relationship management
└── smoke/                    Quick smoke tests
    ├── health.spec.ts        API health check
    └── pages-load.spec.ts    All pages render without error
```

### CI Pipeline Target State

```
GitHub Actions CI
├── lint-client          (existing)
├── lint-server          (existing)
├── typecheck-client     (existing)
├── typecheck-server     (existing)
├── test-client          (existing — Vitest unit tests)
├── test-server          (existing — Jest unit tests + PostgreSQL)
├── build-client         (existing)
├── test-e2e             (NEW — Playwright against built app)
├── coverage-report      (NEW — post coverage summary on PRs)
└── deploy-staging       (NEW — trigger Render deploy on main)
```
