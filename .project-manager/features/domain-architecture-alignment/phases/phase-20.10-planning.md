<!-- harness-planning-rollup tier=phase id=20.10 consolidatedAt=2026-04-03T22:13:00.000Z -->

# Consolidated planning: phase 20.10

## Phase 20.10 (parent)

## Story

**As a** maintainer closing the booking-critical residuals, **I want** the live pipeline to reflect the locked lineage and placement contract, **so that** the code no longer teaches or depends on the differential-role-era model.

**Estimated size:** **M–L**

---

## Goal

1. Finish lineage-based part correlation.
2. Finish placement-driven slot/layout residuals.
3. Verify zero-out ordering and remove remaining booking-side differential-role-era drift.

## Decomposition

- **Session 20.10.1:** Lineage and part-correlation residuals
- **Session 20.10.2:** Slot/placement/layout residuals
- **Session 20.10.3:** Zero-out verification and differential-role-era booking cleanup

## Acceptance Criteria

- [ ] Booking resolution no longer depends on `partShape` grouping as truth
- [ ] Placement derives from event instances plus placement types
- [ ] Zero-out ordering is verified in the real pipeline
