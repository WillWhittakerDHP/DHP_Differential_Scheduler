# Session 6.12.4 Guide: Events — block-level ownership

**Purpose:** Tier harness session guide (task registered for `/task-start` / cascade). Work is retrospective.

**Tier:** Session (Tier 2)

---

## Quick Start

### Session Overview

**Session ID:** 6.12.4  
**Session Name:** Events — block-level ownership  
**Status:** Complete

### Tasks

- [x] #### Task 6.12.4.1: Schema and pipeline for block-owned events (retro)
**Goal:** `valid_events` parent on block shapes; `event_assignments` keyed to block instance parents; client booking graph updated.
**Files:** Migrations, models, `relationshipConstants`, `selectableDisplayConfig`, `appointmentSlotBuilder`, `inviteOrchestrationService` (see `sessions/task-6.12.4.1-planning.md`).
**Approach:** Migrate part-parent rows via junction lookup; remove orphans per plan.
**Checkpoint:** Migrations `20260432_000034`–`000036`; invites query by block id list only.

---

## Session Workflow

For `/session-start`, checkpoints, and agent response norms, see `sessions/session-6.12.1-guide.md` (Guide Structure and Session Workflow).
