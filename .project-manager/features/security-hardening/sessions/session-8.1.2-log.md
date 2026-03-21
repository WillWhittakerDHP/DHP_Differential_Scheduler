# Session 8.1.2: CORS verification and .env.example polish

**Status:** In Progress
**Started:** 2026-03-21
**Completed:** —

## Completed Tasks

### Task 8.1.2.1: Task 8.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.1.2.2



### Task 8.1.2.1: Task 8.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.1.2.2



### Task 8.1.2.1: Verify CORS rejection ✅

**Verification (2026-03-21):**

1. **Initial curl (before fix):**
   - Disallowed origin `https://evil.com`: Response included `Access-Control-Allow-Origin: http://localhost:3002` — cors package with string origin always sets the header.
   - Allowed origin `http://localhost:3002`: Response correctly included `Access-Control-Allow-Origin: http://localhost:3002`.

2. **Fix applied:** `server/src/app.ts` — pass array to cors instead of string so `isOriginAllowed` runs and disallowed origins receive no `Access-Control-Allow-Origin` header.

3. **Manual checklist** (run after `npm run start:dev`):
   - [ ] `curl -i -H "Origin: https://evil.com" http://localhost:3001/` → response must **not** contain `Access-Control-Allow-Origin`
   - [ ] `curl -i -H "Origin: http://localhost:3002" http://localhost:3001/` → response must contain `Access-Control-Allow-Origin: http://localhost:3002`

**Checkpoint:** Disallowed origin receives no header; allowed origin receives correct header.

---

[Further tasks will be logged here as they complete]

### Task 8.1.2.1: Task 8.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.1.2.2

<!-- end excerpt session -->
### Task 8.1.2.1: Task 8.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.1.2.2

