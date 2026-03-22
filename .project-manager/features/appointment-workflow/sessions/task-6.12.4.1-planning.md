# Plan: task 6.12.4.1 — Schema and pipeline for block-owned events (retro)

## Contract

- **Tier:** task | **ID:** 6.12.4.1
- **Scope:** DB migrations, models, `relationshipConstants` / `RELATIONSHIP_KEYS`, `selectableDisplayConfig`, `appointmentSlotBuilder`, `inviteOrchestrationService`, admin metadata migrations

## Delivered (retro)

- `valid_events.parent_id` → `block_shapes`.
- `event_assignments` rows use block instance parents; part-parent rows migrated or removed.
- Client booking graph uses block-parent event assignments when grouping by part shape name.

## References

- **Session log:** `sessions/session-6.12.4-log.md`

## Checkpoint (retro)

- [x] Migrations `20260432_000034`–`000036` authored
- [x] Server relationship CRUD accepts block instance only for event assignments
- [x] Invites query assignments by block id list only
