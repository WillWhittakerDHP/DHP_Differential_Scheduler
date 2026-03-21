# Session 8.1.2 Guide: CORS verification and .env.example polish

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 8.1.2
**Session Name:** CORS verification and .env.example polish
**Description:** Verify CORS rejects disallowed origins; polish .env.example documentation for CORS_ORIGIN.

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 8.1.2.1: Verify CORS rejection
**Goal:** curl disallowed origin, confirm rejection
**Files:** Reference API endpoint
**Approach:** curl -H "Origin: https://evil.com" to API; verify CORS error or no Access-Control-Allow-Origin
**Checkpoint:** Disallowed origin rejected; allowed origin (localhost) succeeds

- [ ] #### Task 8.1.2.2: Polish .env.example
**Goal:** Expand CORS_ORIGIN doc with dev/production examples
**Files:** server/.env.example
**Approach:** Add commented examples for localhost (dev) and Render URL (production); document comma-separated format
**Checkpoint:** .env.example has clear CORS_ORIGIN examples

---

## Session Workflow

See `.cursor/commands/tiers/session/templates/session-guide.md` for full workflow template.

---

## Related Documents

- Phase Guide: `../phases/phase-8.1-guide.md`
- Session Log: `session-8.1.2-log.md`
- Feature Guide: `../../feature-security-hardening-guide.md`
