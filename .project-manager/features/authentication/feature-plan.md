# Feature 7: Authentication — Feature Plan

**Feature:** Authentication & User Identity (Strategy Pattern)
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 2A

---

## Goal

Collect user data during beta, enable role-based access, and auto-populate returning users — while building an architecture that swaps from passwordless (beta) to full password auth (production) via environment config alone.

**Why Strategy Pattern:** Both Magic Link and Password auth end at the same place — a session for an authenticated user. They only differ in *how* the user proves their identity. Building one shared session/middleware layer with pluggable "proof of identity" strategies means the swap from beta to production auth requires zero rework of middleware, stores, router guards, or API contracts.

**Architecture Decision:** Session tokens in PostgreSQL (not JWT). Revocation is trivial (delete the row), no signing infrastructure needed, and the upgrade to JWT later (if needed) changes only `sessionManager.ts` internals — the API contract stays identical.

---

## Architecture

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

## Data Flow

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

## File Structure (New Files)

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

---

## Phase 10.1: Database & Models

### Checklist

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

---

## Phase 7.2: Server Infrastructure (Strategy Interface, Session Manager, Auth Config, Middleware, Router)

- [ ] **2A.4** Create auth strategy interface (`server/src/auth/strategies/strategyTypes.ts`)

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

  function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  export async function createSession(userId: string): Promise<string> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await Session.create({ userId, token, expiresAt });
    logger.debug(`Session created for user ${userId}`);
    return token;
  }

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

  export async function destroySession(token: string): Promise<void> {
    await Session.destroy({ where: { token } });
  }

  export async function cleanExpiredSessions(): Promise<number> {
    const deleted = await Session.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } },
    });
    logger.debug(`Cleaned ${deleted} expired sessions`);
    return deleted;
  }
  ```

  **Session cleanup:** Call `cleanExpiredSessions()` on a periodic interval. Add to server startup (e.g. in `app.ts` or a dedicated `startScheduledJobs()` function):

  ```typescript
  import { cleanExpiredSessions } from './auth/sessionManager.js';

  setInterval(() => {
    cleanExpiredSessions().catch((err) => logger.error('Session cleanup failed:', err));
  }, 6 * 60 * 60 * 1000);

  cleanExpiredSessions().catch((err) => logger.error('Initial session cleanup failed:', err));
  ```

- [ ] **2A.6** Create auth config with environment routing (`server/src/auth/authConfig.ts`)

  ```typescript
  import { NODE_ENV } from '../constants/appConstants.js';
  import type { AuthStrategy } from './strategies/strategyTypes.js';
  import { MagicLinkStrategy } from './strategies/magicLinkStrategy.js';
  // import { PasswordStrategy } from './strategies/passwordStrategy.js';
  import { createLogger } from '../utils/logger.js';

  const logger = createLogger('AuthConfig');

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

- [ ] **2A.7** Fill in `requireAuth` middleware and add `requireRole` (`server/src/middlewares/security.ts`)

  ```typescript
  import { validateSession } from '../auth/sessionManager.js';
  import type { SessionUser } from '../auth/sessionManager.js';

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

- [ ] **2A.10** Create auth router (`server/src/auth/authRouter.ts`)

  ```typescript
  import { Router } from 'express';
  import { authStrategy } from './authConfig.js';
  import { validateSession, destroySession } from './sessionManager.js';
  import { requireAuth } from '../middlewares/security.js';

  const router = Router();

  router.get('/config', (_req, res) => {
    res.json(authStrategy.getClientConfig());
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

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

  router.use('/', authStrategy.getRoutes());

  export { router as AuthRouter };
  ```

- [ ] **2A.11** Mount auth router and add cookie-parser

  In `server/src/routes/index.ts`: `v1Router.use('/auth', AuthRouter)`. In `app.ts`: `app.use(cookieParser())`. Install: `npm install cookie-parser` and `npm install -D @types/cookie-parser`.

- [ ] **2A.12** Add auth environment variables to `server/src/config/envConfig.ts`

  Add to EnvConfig interface: `CLIENT_URL: string;` `AUTH_STRATEGY: string;` `RESEND_API_KEY: string | null;`. In Joi schema: `CLIENT_URL: Joi.string().default('http://localhost:3002'),` `AUTH_STRATEGY: Joi.string().valid('magic_link', 'password').optional(),` `RESEND_API_KEY: Joi.string().optional().allow('', null),`

---

## Phase 7.3: Magic Link Strategy (Beta / Development)

- [ ] **2A.8** Create email service (`server/src/auth/emailService.ts`)

  ```typescript
  import { createLogger } from '../utils/logger.js';
  import { NODE_ENV } from '../constants/appConstants.js';

  const logger = createLogger('EmailService');

  export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
  }

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

    // TODO: Wire in real email provider (Resend, SendGrid, etc.)
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

  Implement AuthStrategy: getClientConfig() returns `{ strategyName: 'magic_link', requiresPassword: false }`. getRoutes() returns a Router with:
  - POST /magic-link: body `{ email, firstName?, lastName? }`; find-or-create user; generate token; save MagicLink; send email with link `${CLIENT_URL}/auth/verify?token=...`; respond with generic message.
  - POST /verify: body `{ token }`; find MagicLink where usedAt is null and not expired; mark usedAt; createSession; set httpOnly cookie; return user.
  Use MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000. Full code in BETA_LAUNCH_CHECKLIST.md Phase 2A.9.

---

## Phase 7.4: Client-Side Auth

- [ ] **2A.13** Create Pinia auth store (`client/src/stores/auth.ts`)

  Define store with: user (ref), authConfig (ref), isLoading, isInitialized; computed isAuthenticated, isAdmin; actions fetchAuthConfig, fetchCurrentUser, requestMagicLink(email, firstName?, lastName?), verifyMagicLink(token), logout. Use apiClient for GET /api/v1/auth/config, GET /api/v1/auth/me, POST /api/v1/auth/magic-link, POST /api/v1/auth/verify, POST /api/v1/auth/logout. Full code in BETA_LAUNCH_CHECKLIST.md Phase 2A.13.

- [ ] **2A.14** Create `AuthView.vue` — VContainer with VCard; if !authConfig show skeleton; else if strategyName === 'magic_link' show MagicLinkForm; else if 'password' show placeholder or PasswordLoginForm. onMounted: fetchAuthConfig().

- [ ] **2A.15** Create `MagicLinkForm.vue` — VForm with email, optional firstName/lastName (when "I'm a new user" checked), submit calls requestMagicLink; show success/error alerts. Validation rules for required and email format.

- [ ] **2A.16** Create `MagicLinkVerifyView.vue` — read route.query.token; onMounted call verifyMagicLink(token); on success router.replace(redirect ?? '/'); on error show error message and link to /auth.

- [ ] **2A.17** Add auth routes to Vue Router: path /auth (AuthView), path /auth/verify (MagicLinkVerifyView), meta requiresAuth: false. In beforeEach: if !isInitialized await fetchCurrentUser(); if requiresAuth && !isAuthenticated redirect to auth with query.redirect; if path starts with /admin && !isAdmin redirect to home.

- [ ] **2A.18** Initialize auth on app startup: call fetchCurrentUser() early in App.vue onMounted or in router.beforeEach before other checks.

(Full Vue template and script code: BETA_LAUNCH_CHECKLIST.md Phase 2A.14–2A.18.)

---

## Phase 7.5: Password Strategy (Production — Deferred)

- [ ] **2A.19** Create `login` table migration (when ready for production). SQL: CREATE TABLE public.login (id serial PRIMARY KEY, user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE, email varchar(255) NOT NULL UNIQUE, password_hash varchar(255) NOT NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL);

- [ ] **2A.20** Create Password strategy (`server/src/auth/strategies/passwordStrategy.ts`): class PasswordStrategy implements AuthStrategy, name = 'password', getClientConfig() returns { strategyName: 'password', requiresPassword: true }, getRoutes() returns Router with stubs for POST /register, /login, /forgot-password, /reset-password.

- [ ] **2A.21** Create `PasswordLoginForm.vue` when transitioning to production (email + password fields, submit to login).

- [ ] **2A.22** In authConfig.ts, when NODE_ENV === 'production', return new PasswordStrategy(); or use AUTH_STRATEGY env var for override.

---

## Enact After Auth (Integration Todos)

When authentication is in place, implement the following so other features can rely on authenticated users and roles:

- [ ] **Enact held/override (Feature 6 stubs):** Wire role checks into Feature 6 stubs so trusted agents and admins can hold slots and admins can override blockages.
- [ ] **Enact scheduled-by auto-population (Feature 6.6):** Set `scheduled_by_id` from the current logged-in user on appointment create; optionally track who last updated the appointment on edit. Use `req.user` and persist via appointment API.
- [ ] **Role-based access:** Restrict admin panel and admin-only routes to authenticated users with appropriate roles (e.g. agent, transaction_manager).
- [ ] **Guided beta and feedback:** Where Feature 13 (Guided Beta Testing) or Feature 14 (Beta Feedback Response) need user identity or email (e.g. show tasks when authenticated, email notifications to reporter), wire in auth so those features can rely on current user/session.

---

## Dependencies to Install

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

## Decision Log

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

## What This Gives You for Beta

1. **Email collection** — every user gives their email to get a magic link
2. **User tracking** — sessions tie feedback, appointments, and behavior to specific users
3. **Role-based access** — admin panel restricted to `agent` / `transaction_manager` roles
4. **Auto-populate** — returning users recognized by session; forms pre-fill their info
5. **Rescheduling access** — users see "their" appointments because `req.user` is set
6. **Zero-rework upgrade path** — password strategy slots into the same architecture

---

**Last Updated:** 2026-02-18
