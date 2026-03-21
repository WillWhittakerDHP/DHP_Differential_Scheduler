# Plan: task 8.1.1.1 — Add CORS_ORIGIN to envConfig

## Contract
- **Tier:** task | **ID:** 8.1.1.1
- **Scope:** Add CORS_ORIGIN to env schema and validated config export
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this task.

## Goal
Add `CORS_ORIGIN` to the env validation (Joi schema) and export it from `envConfig`. Support a single origin or comma-separated list. The value will be consumed by `app.ts` in the next task.

## Files
- `server/src/config/envConfig.ts` — add CORS_ORIGIN to Joi schema, EnvConfig interface, and validated config; parse comma-separated into string or array for cors() consumption

## Approach
1. Add `CORS_ORIGIN: Joi.string().required()` to the Joi schema (or `.default('http://localhost:3002')` for dev if we allow optional in dev — session says required).
2. Add `CORS_ORIGIN: string` to `EnvConfig` interface.
3. Export a helper or the raw value: cors expects `origin: string | string[] | ((origin, cb) => void)`. For comma-separated, split and trim to produce `string[]`; for single, pass as `string`.
4. Explicit return types per function governance. No silent fallbacks.

## Checkpoint
- `envConfig.CORS_ORIGIN` is available and typed
- Server starts successfully with `CORS_ORIGIN` set in env
- Comma-separated origins parse correctly
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.1.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
