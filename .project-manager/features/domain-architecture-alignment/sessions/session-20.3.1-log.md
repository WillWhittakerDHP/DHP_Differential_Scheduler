# Session 20.3.1: — Placement type editor (§8.3 #1):** Introduce or elevate **PlacementTypeEditor** (or equivalent) for `eventShape` **placementKind** / **anchorEdge**; align field displays (`eventShapeDisplays.ts`), forms, and admin copy with placement semantics; remove or reword differential-role-forward labels on shape surfaces.


### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2



## Completed Tasks

### Task 20.3.1.2: Task 20.3.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.3



### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2

<!-- end excerpt session -->



### Task 20.3.1.2: Task 20.3.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`, `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/utils/admin/differentialRoleMatrixRows.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.1-guide.md               |  2 +-
 .../sessions/session-20.3.1-log.md                 | 15 ++++++++++
 .../fields/DifferentialEventRoleOverridesField.vue | 20 +++++++++----
 .../appliedDisplay/blockInstanceDisplays.ts        | 10 +++++++
 .../display/appliedDisplay/eventShapeDisplays.ts   |  4 +--
 .../src/utils/admin/differentialRoleMatrixRows.ts  | 33 ++++++++++++++++++++--
 6 files changed, 73 insertions(+), 11 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
index 9ec691c3..516b4f7a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
@@ -60,7 +60,7 @@ These sections contain session-specific content:
 **Approach:** Add focused component + register for `eventShape` / `placementKind`+`anchorEdge`; mirror server pairing rules in UI.
 **Checkpoint:** Create/edit event shape in Shapes tab; payload shows correct placement fields; anchor hidden or cleared for primary.
 
-- [ ] #### Task 20.3.1.2: Placement-forward copy cleanup
+- [x] #### Task 20.3.1.2: Placement-forward copy cleanup
 **Goal:** `eventShapeDisplays` + **DifferentialEventRoleOverridesField** captions/help use **placement** vocabulary; grep stragglers on shape surfaces.
 **Files:**
 - `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
index 3cacfe06..78d74d47 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
@@ -11,6 +11,14 @@
 