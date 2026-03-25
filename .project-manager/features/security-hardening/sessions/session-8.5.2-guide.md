# Session 8.5.2 Guide: Content-Security-Policy (Helmet) for API + Vue SPA

**Purpose:** Canonical harness target for CSP work (not only `rollup-archive/`).

**Tier:** Session

---

## Quick Start

**Session ID:** 8.5.2  
**Scope:** Tune **`contentSecurityPolicy`** in `server/src/app.ts` so production stays strict; development allows Vite HMR (`unsafe-inline` / `unsafe-eval` on `script-src` where needed).

**Primary files**

- `server/src/app.ts` — `helmet({ contentSecurityPolicy: { directives: … } })`
- `client/` — production `npm run build`; smoke in browser console for CSP violations

**Success criteria**

- [x] CSP enabled in all environments; dev relaxed for local Vite.
- [ ] Staging/production: zero blocking violations on admin + booking wizard (iterate `connect-src` / `img-src` as integrations require).

**Harness anchor:** `session-start 8.5.2` (feature `security-hardening`).

---

## Notes

- Cross-reference: [GAP_CLOSURE_CHECKLIST.md](../../../GAP_CLOSURE_CHECKLIST.md) row **GC-8.5.2**.
