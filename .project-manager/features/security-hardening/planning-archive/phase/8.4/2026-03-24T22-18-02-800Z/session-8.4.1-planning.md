<!-- harness-planning-rollup tier=session id=8.4.1 consolidatedAt=2026-03-24T22:18:02.787Z -->

# Consolidated planning: session 8.4.1

## Session 8.4.1 (parent)

## Goal

Inventory all environment variable usage across the project; validate .env.example completeness; ensure no hardcoded secrets. Document the env var inventory and safe-handling patterns. (Committed-files scan and .gitignore verification are Session 8.4.2.)

## Files

- `server/.env.example`, `server/.env.development`, `server/.env.production` — audit against usage
- Root `.env`, `.env.example` — if present; audit
- `server/src/**` — scan for process.env and config usage
- `client/src/**` — scan if any env usage (Vite import.meta.env)
- Any `*.config.*` or config loaders — ensure they read from env
- `server/SECURITY_STUBS.md` or equivalent — document env inventory

## Approach

1. Grep for `process.env`, `import.meta.env`, and config-loading patterns across server and client
2. Cross-check findings against .env.example; add missing vars (placeholders, no real values)
3. Scan for hardcoded API keys, passwords, tokens; replace with env vars if any found
4. Document env var inventory (required vs optional) and safe-handling patterns

## Checkpoint

- Env var inventory documented
- .env.example covers all required vars
- No hardcoded secrets in codebase

---

## Task 8.4.1.1 (source: task-8.4.1.1-planning.md)

### Goal

Grep server and client codebases for `process.env` and `import.meta.env` usage; produce a structured env var inventory documenting every variable used, its source file(s), and whether it is required or optional. (Validation and remediation are Task 8.4.1.2.)

### Files

- `server/src/**` — grep for process.env and config usage
- `client/src/**` — grep for import.meta.env (Vite)
- Any `*.config.*`, `config.ts`, or env-loading modules
- `server/SECURITY_STUBS.md` or `server/docs/` — create or append env inventory section (output)

### Approach

1. Grep for `process\.env\.\w+` in server/src; note variable names and file paths
2. Grep for `import\.meta\.env\.\w+` (or `VITE_*`) in client/src; note variable names
3. Check config loaders (e.g. dotenv, env vars in app startup)
4. Collate results into inventory: var name | source files | required/optional | purpose
5. Write inventory to SECURITY_STUBS or a dedicated env-inventory doc

### Checkpoint

- Env var inventory document exists with all process.env and import.meta.env vars
- Each var lists source file(s) and required/optional
---

---

## Task 8.4.1.2 (source: task-8.4.1.2-planning.md)

### Goal

Cross-check the env inventory against `server/.env.example` (and root `.env.example` if present); add any missing required vars as placeholders. Scan committed files for hardcoded secrets (API keys, passwords, tokens); replace with env vars or document as a finding. Ensure .env.example is complete and no secrets remain in code.

### Files

- `server/.env.example` — add missing vars from inventory (placeholders only)
- Root `.env.example` — create or update if cross-cutting vars need documentation
- `server/src/**`, `client/src/**` — scan for hardcoded secrets; fix if found
- `server/docs/SECURITY_STUBS.md` — reference inventory; add validation notes if needed

### Approach

1. Compare inventory (SECURITY_STUBS) to server/.env.example; list missing vars
2. Add missing vars to server/.env.example with placeholder comments (no real values)
3. Grep for high-risk patterns (API keys, client IDs, secrets) in committed code
4. If hardcoded secrets found: replace with process.env/import.meta.env and document; otherwise document as clean
5. Update root .env.example if cross-cutting vars (TEST_ENABLED, GIT_MCP_SERVER, VITE_*) need docs

### Checkpoint

- server/.env.example documents all required vars from inventory
- No hardcoded secrets in committed files (or remediated)
- SECURITY_STUBS validation section updated if findings
---

---
