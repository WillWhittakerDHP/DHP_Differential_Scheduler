# Session 20.6.3 Log: Legacy differential-role and event-shape remnants

**Status:** In Progress
**Date:** 2026-04-03

---

## Session Goal

[Document concrete session goal]

### Task 20.6.3.1: Task 20.6.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.2



## Completed Tasks

### Task 20.6.3.2: Task 20.6.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.3



### Task 20.6.3.1: Task 20.6.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.2

<!-- end excerpt session -->



### Task 20.6.3.2: Task 20.6.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md`, `client/auto-imports.d.ts`, `client/src/types/appointmentModels.ts`, `client/src/utils/eventAttendeeUtils.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.3.2-handoff.md`

### `git diff --stat HEAD`

```text
.../analysis/DOMAIN_REWRITE_WORKLOG.md             |  5 +++
 .../sessions/session-20.6.3-guide.md               |  2 +-
 .../sessions/session-20.6.3-log.md                 | 15 +++++++
 client/auto-imports.d.ts                           |  4 --
 client/src/types/appointmentModels.ts              |  3 +-
 client/src/utils/eventAttendeeUtils.ts             | 51 ++--------------------
 6 files changed, 25 insertions(+), 55 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index 9b6e7713..56be5b45 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -306,3 +306,8 @@
 | **Legacy assumptions** listed in **FEATURE_20** section **2** are either **removed** or **mapped** to their replacement storage. | **`### Legacy assumption closure (session 20.5.3)`** — **`#### §0.2 legacy assumptions → replacement`**; **`#### §2 model targets vs legacy (closure)`**. | Maps **§0.2** and **§2** themes to migrations / anchors without duplicating full **FEATURE_20** §2 tables. |
 | **No migration step** depends on **undocumented implicit defaults**. | **`#### Migration implicit-default audit`** (under **`### Legacy assumption closure`**); cross-ref **`### Baseline placement & event routing`** + **§9.6 mitigation**. | **`20260432_*`** steps are **explicit** DDL/data moves per file headers; routing graphs are **not** ORM-invented defaults. |
 | **Admin metadata retirement** narrative is **traceable in-repo** and states **ordering** (domain UI → optional export → client/API removal → DDL in Pass 6). | **`### Admin metadata retirement (Pass 5 narrative)`** | Added per **§8.5** fourth acceptance bullet; execution in **20.6** per **§6.3a** / **§8.6**. |
+
+### Pass 6 / session 20.6.3.2 — booking no longer models block-instance role overrides
+
+- **`AppointmentShape`** drops **`differentialEventRoleOverrides`** (column already removed in **059**); **`client/src/utils/eventAttendeeUtils.ts`** resolves primary/secondary from **`placement_kind`** only.
+- **`shared/utils/differentialRoleUtils.ts`** removes **`effectiveDifferentialRole`**, **`sanitizeDifferentialEventRoleOverridesInput`**, and **`isDifferentialRoleOverrideValue`** (grep-clean after admin + booking retirement).
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
index 67c4614e..5b6f2615 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
@@ -63,7 +63,7 @@ These sections contain session-specific content:
 **Approach:** Grep-driven removal; smoke Instances tab block instance editor.
 **Checkpoint:** **`rg differentialEventRoleOverrides`** clean in admin configs/components.
 
-- [ ] #### Task 20.6.3.2: Booking + types + optional event-instance remnant scan
+- [x] #### Task 20.6.3.2: Booking + types + optional event-instance remnant scan
 **Goal:** Remove **`differentialEventRoleOverrides`** from **`appointmentModels`** and consumers; simplify **`eventAttendeeUtils`** (placement-derived roles only); review **`entityTransformers`**; optional **event-instance** admin component cleanup if provably dead.
 **Files:**
 - `client/src/types/appointmentModels.ts`, `client/src/utils/eventAttendeeUtils.ts`, booking callers
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
index e20f663e..0ba139d1 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
@@ -19,6 +19,14 @@
 