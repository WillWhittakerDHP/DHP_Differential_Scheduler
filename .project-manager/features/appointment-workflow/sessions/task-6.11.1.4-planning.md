# Plan: task 6.11.1.4 — Fee pipeline (drive line item)

## Contract
- **Tier:** task | **ID:** 6.11.1.4
- **Scope:** Confirmation / fee preview UI totals and Drive time row

## Goal
Use `computeDriveTimeFee` with business `driveTimeFee` settings; append **Drive time** line item; include amount in order totals.

## Checkpoint
- [x] Confirmation and availability fee preview show Drive time when slot selected; $0 / Free when fee is zero.
- [x] Settings merged safely (`mergeDriveTimeFeeConfig`); tests cover drive row and merge edge cases.
- [x] `vue-tsc` and lint pass for touched files.

## Task-end (2026-03-15)
Closed. Handoff: `task-6.11.1.4-handoff.md`. Cascade: **`/task-start 6.11.1.5`** (persist drive fee via virtual block + `buildAppointmentFeeBreakdown`).

## Next
- **Task 6.11.1.5:** Persist drive time in fee breakdown via system “Drive time” block instance.
