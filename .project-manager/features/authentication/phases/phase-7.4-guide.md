# Phase 7.4: Client-Side Auth & Enactment

**Purpose:** Phase-level guide for planning and tracking Vue client auth, router guards, and server enactment (internal API access policy).

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 7.4  
**Phase Name:** Client-Side Auth & Enactment  
**Description:** Session cookie usage from the SPA (`withCredentials`), Pinia auth store and composables, `/login` and magic-link verify UX, admin vs anonymous paths, and selective `requireAuth` / `requireRole` on internal routes aligned with CSRF and ownership middleware order.

**Duration:** TBD  
**Status:** Complete

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
**Description:** Reserved for intermediate 7.4 client work outside numbered session guides; marked complete for harness sequencing.
**Tasks:** N/A
**Focus:**
- No separate guide

- [x] ### Session 7.4.3: Client auth tranche (historical — placeholder)
**Description:** Harness sequential rule placeholder before **7.4.4**.
**Tasks:** N/A
**Focus:**
- Superseded by **7.4.4**

- [x] ### Session 7.4.4: Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).
**Description:** Matrix (`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`); gate **`GET /appointments/list-for-admin-entry`**; **GC-7-E1** closed per checklist.
**Tasks:** 7.4.4.1 (matrix), 7.4.4.2 (middleware)
**Focus:**
- See session log and `INTERNAL_API_ENACTMENT_MATRIX.md`

---

## Dependencies

**Prerequisites:**

- Phase 7.3: Magic-link verify establishes server session and cookie
- Feature 8: CSRF and ownership middleware available for ordering on mutating routes

**Downstream Impact:**

- Phase 7.5 (deferred): password strategy
- Gap closure: **GC-7-E1** (addressed in session **7.4.4**)

---

## Success Criteria

- [x] Internal API enactment matrix published and priority route gated (session **7.4.4**)
- [ ] Client auth store and guards fully aligned (ongoing / prior tranches)
- [ ] Booking wizard paths remain usable without admin session where product rules require it

---

## Related Documents

- Feature guide: `.project-manager/features/authentication/feature-authentication-guide.md`
- Checklist: `.project-manager/GAP_CLOSURE_CHECKLIST.md` (**GC-7.4**, **GC-7-E1**)

---

## Notes

Session **7.4.4** completed tasks **7.4.4.1**–**7.4.4.2** (matrix + `list-for-admin-entry` auth). Further per-route gates follow `INTERNAL_API_ENACTMENT_MATRIX.md`.

<!-- end excerpt phase -->
