# Session 20.3.3: — Remaining domain editors (§8.3 #3):** Other shape-type instance editors: orchestration selection UX for **time** / **price** / **event** instances as needed; shared patterns from 20.3.1–20.3.2.


### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2



## Completed Tasks

### Task 20.3.3.2: Task 20.3.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.3



### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2

<!-- end excerpt session -->



### Task 20.3.3.2: Task 20.3.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md`, `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.2-planning.md`, `client/src/utils/forms/applyPrimitiveDisplayOverlay.ts`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.3-guide.md               |  2 +-
 .../sessions/session-20.3.3-log.md                 | 15 ++++++++++++++
 .../appliedDisplay/blockInstanceDisplays.ts        | 24 ++++++++++++++++++++++
 .../forms/formFieldsMetadataWarningResolution.ts   |  4 +++-
 4 files changed, 43 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
index 5e307941..6f58ec58 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
@@ -61,7 +61,7 @@ These sections contain session-specific content:
 **Approach:** Reuse or generalize **20.3.2** patterns; explicit types; logger on failed updates.
 **Checkpoint:** Lint + type-check; manual smoke on Instances tab for time + price shapes.
 
-- [ ] #### Task 20.3.3.2: Event block instance — orchestration copy & display
+- [x] #### Task 20.3.3.2: Event block instance — orchestration copy & display
 **Goal:** Validity-constrained **orchestration** language on **event** block instance cards (labels/descriptions/display metadata).
 **Files:**
 - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
index f3eaeda4..5c1909b5 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
@@ -11,6 +11,14 @@
 