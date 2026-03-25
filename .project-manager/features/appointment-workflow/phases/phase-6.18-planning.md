# Plan: phase 6.18 — User role catalog, owner rename, block alignment

## Contract

- **Tier:** phase | **ID:** 6.18
- **Scope:** Canonical `@shared` user role list; `seller` → `owner` migration; eliminate duplicate hardcoded role arrays; optional admin persistence for role ↔ user-type block instance alignment
- **Governance:** Type boundaries (`@shared` for cross-client-server strings); no silent fallbacks in mapping

## Goal

Deliver a **maintainable user role vocabulary** aligned with booking and admin flows, rename **`seller`** to **`owner`**, and reduce drift between **ENUM/API/UI** and **user-type block instances** (with Session 6.18.2 for operator-driven alignment).

## Decomposition

| Unit | Session | Outcome |
|------|---------|---------|
| **Shared catalog + rename + audit** | 6.18.1 | `USER_ROLE_VALUES` in `@shared`; migration; Joi/model/client/UI/mapping updated; grep clean |
| **Admin alignment UI** | 6.18.2 | Persisted mapping role → block_instance_id; admin matrix; `getUserTypeBlockIdForRole` prefers config |

## Reference

- `phases/phase-6.18-guide.md`
