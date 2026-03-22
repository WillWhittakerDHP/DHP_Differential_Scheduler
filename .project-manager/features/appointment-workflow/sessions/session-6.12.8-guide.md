# Session 6.12.8 Guide: Relationship fetch normalization

**Purpose:** Tier harness session guide (task registered for `/task-start` / cascade). Work is retrospective.

**Tier:** Session (Tier 2)

---

## Quick Start

### Session Overview

**Session ID:** 6.12.8  
**Session Name:** Relationship fetch normalization (`FetchedRelationship`)  
**Status:** Complete

### Tasks

- [x] #### Task 6.12.8.1: FetchedRelationship user-type field scoping (retro)
**Goal:** Clear `userTypeBlockInstanceId` on `FetchedRelationship`; populate only for `annotationAssignments`; accept legacy raw key on ingest.
**Files:** `fetchToGlobalTransformer.ts`, `relationships.ts`, annotation response types (see `sessions/task-6.12.8.1-planning.md`).
**Approach:** Avoid attendee vs annotation semantic collision on shared keys.
**Checkpoint:** Attendee hydrate does not populate annotation-only field from child id; annotation edges still get user-type id when present.

---

## Session Workflow

For `/session-start`, checkpoints, and agent response norms, see `sessions/session-6.12.1-guide.md` (Guide Structure and Session Workflow).
