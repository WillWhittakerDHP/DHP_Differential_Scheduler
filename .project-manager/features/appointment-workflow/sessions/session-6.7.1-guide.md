# Session 6.7.1 Guide: Backend — set scheduled_by_id on create from req.user

**Purpose:** Session-level guide with task breakdown.
**Tier:** Session

---

## Quick Start

### Session Overview

**Session ID:** 6.7.1
**Session Name:** Backend — set scheduled_by_id on create from req.user
**Description:** Set scheduled_by_id on appointment create from req.user; block client override.

**Duration:** [Estimated hours/days]
**Status:** Complete

### Tasks

- [x] #### Task 6.7.1.1: Backend — set scheduled_by_id on create from req.user

**Goal:** Set scheduled_by_id on appointment create from req.user; block client override (set in create path + block override).

**Files:**
- Server appointment create route/handler; sanitize/request body (create pipeline).

**Approach:** Read req.user, set scheduled_by_id from req.user.id in create path; block client override. If no auth, leave null.

**Checkpoint:** Authenticated create → scheduled_by_id set; unauthenticated → null. Verify per tierUp success criteria.

- [ ] #### Task 6.7.1.2: Set scheduled_by_id in create path from req.user and block client override

**Goal:** Set scheduled_by_id on the appointment create path from req.user (Feature 7); do not allow the client to supply this field on create.

**Files:**
- Server: appointment create route/handler (e.g. server/src/routes/internal/appointments/); sanitizeInput or create pipeline where appointment fields are set.

**Approach:** In the appointment create handler, read req.user (populated by Feature 7 auth middleware). Set scheduled_by_id on the entity from req.user.id before persist. Ensure client cannot override: do not accept scheduled_by_id from request body, or explicitly overwrite with server value in sanitize/create logic.

**Checkpoint:** Creating an appointment while authenticated results in scheduled_by_id populated with the current user id; unauthenticated or missing user handled per product policy (e.g. null or 401).

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 6.7.1 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**Example:**
```
/session-start 6.7.1 "Backend scheduled_by_id"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 6.7.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

- **Simple tasks:** Quick checkpoint (quality only)
- **Complex tasks:** Full checkpoint (quality + optional feedback)
