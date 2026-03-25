# Phase 7.4: Client-Side Auth & Enactment

**Purpose:** Phase-level guide for planning and tracking Vue client auth, router guards, and server enactment (internal API access policy).

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 7.4  
**Phase Name:** Client-Side Auth & Enactment  
**Description:** Session cookie usage from the SPA (`withCredentials`), Pinia auth store and composables, `/login` and magic-link verify UX, admin vs anonymous paths, and selective `requireAuth` / `requireRole` on internal routes aligned with CSRF and ownership middleware order.

**Duration:** TBD  
**Status:** In progress

---

## Phase Objectives

- Align Vue router and API client with the server session + httpOnly cookie contract
- Gate admin SPA routes while preserving anonymous booking wizard flows
- Document and implement router-level internal API policy (roles, allowlists, ordering with CSRF and appointment ownership)

---

## Tasks

Sessions and tasks for this phase are listed under **Sessions Breakdown** below. Use `/session-add` to register new session rows; `/session-start` materializes session guides and planning docs.

---

## Sessions Breakdown

- [x] ### Session 7.4.1: Client auth tranche (historical — GC-7.4)
**Description:** Session cookie via `withCredentials`, Pinia auth store + composable, `/login` + magic-link verify UX baseline; delivered before this phase guide file existed. Marked complete for harness sequencing only.
**Tasks:** N/A (retroactive)
**Focus:**
- See checklist **GC-7.4** / prior implementation under `client/src/stores/authStore.ts`, `client/src/router/index.ts`

- [x] ### Session 7.4.2: Client auth tranche (historical — placeholder)
**Description:** Reserved for any intermediate 7.4 client work done outside numbered session guides; marked complete so **7.4.4** can start per harness sequential rule.
**Tasks:** N/A
**Focus:**
- No separate guide; align with feature handoff if split is needed later

- [x] ### Session 7.4.3: Client auth tranche (historical — placeholder)
**Description:** Same as 7.4.2 — harness requires **7.4.3** checkbox complete before **7.4.4** `session-start`.
**Tasks:** N/A
**Focus:**
- Superseded by explicit **7.4.4** enactment session

- [ ] ### Session 7.4.4: Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).
**Description:** Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).
**Tasks:** [To be planned]
**Focus:**
- [To be identified during planning]

---

## Dependencies

**Prerequisites:**

- Phase 7.3: Magic-link verify establishes server session and cookie
- Feature 8: CSRF and ownership middleware available for ordering on mutating routes

**Downstream Impact:**

- Phase 7.5 (deferred): password strategy
- Gap closure: **GC-7-E1** (enactment / internal API policy)

---

## Success Criteria

- [ ] Client auth store and guards match server session semantics
- [ ] Internal API policy documented (handoff + checklist) and verified (lint + smoke)
- [ ] Booking wizard paths remain usable without admin session where product rules require it

---

## Related Documents

- Feature guide: `.project-manager/features/authentication/feature-authentication-guide.md`
- Checklist: `.project-manager/GAP_CLOSURE_CHECKLIST.md` (**GC-7.4**, **GC-7-E1**)

---

## Notes

Prior **GC-7.4** client tranche (cookie, store, login UX) may predate this guide file; this document is the canonical phase parent for new **7.4.x** harness sessions (e.g. **7.4.4** — enactment).

<!-- end excerpt phase -->
