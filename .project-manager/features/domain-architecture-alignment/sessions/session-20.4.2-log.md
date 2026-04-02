# Session 20.4.2: Remove differential-role enrichment; narrow PartFinal (§8.4 / §4.3)

## Completed Tasks

### Task 20.4.2.1: Remove role enrichment + narrow PartFinal ✅

**Completed:** 2026-04-02  
**Goal:** Remove **`enrichBlockFinalsWithDifferentialRoles`**; drop **`PartFinal.major` / `minor` / `minimizer`**; keep **`eventAssignmentsByPartShape`** → **`calculateSlotShape`**.  
**Code:** `dfd18ce8` — `refactor(booking): remove enrichBlockFinalsWithDifferentialRoles; narrow PartFinal (20.4.2.1)`

### Task 20.4.2.2: Slot shape, time axis, perspective, minimizer (placement-first) ✅

**Completed:** 2026-04-02  
**Goal:** **`placement_kind`**-first primary/secondary for differential offsets and perspective; **`floating`** placement for minimizer segments when overrides empty; legacy effective-role path when overrides non-empty.  
**Code:** `272f8c09` — `refactor(booking): placement-first primary/secondary and floating minimizer (20.4.2.2)`  
**Next step:** All planned tasks in this session are done — cascade **`/session-end 20.4.2`**.
