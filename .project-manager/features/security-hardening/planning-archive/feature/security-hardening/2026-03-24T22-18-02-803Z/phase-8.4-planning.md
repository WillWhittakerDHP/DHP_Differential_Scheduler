<!-- harness-planning-rollup tier=phase id=8.4 consolidatedAt=2026-03-24T22:18:02.800Z -->

# Consolidated planning: phase 8.4

## Phase 8.4 (parent)

## Goal

Complete a secrets audit for the project: (1) inventory all environment variable usage and ensure secrets are loaded from env, not hardcoded; (2) verify no secrets or credentials exist in committed files. Document patterns in SECURITY_STUBS and ensure .env.example + .gitignore are complete.

## Files

- `server/.env.example`, `server/.env.development`, `server/.env.production` — template and env patterns
- Root `.env`, `.env.example` — if present
- `.gitignore` — ensure .env* and credential files excluded
- `server/src/**` — scan for process.env usage and any hardcoded strings
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` or equivalent — document audit findings
- Any `*.config.*` or config loaders that may hold secrets

## Approach

1. **Env audit:** Inventory all `process.env` (or config) usage across server/client; cross-check against .env.example; ensure no defaults contain secrets; document required vs optional vars.
2. **Committed-file scan:** Verify .gitignore covers .env*, .google-tokens.json, and any credential paths; optionally run a grep/truffleHog-style scan for high-entropy strings or known patterns; document safe patterns.
3. **Documentation:** Add "Secrets audit" section to SECURITY_STUBS with env var inventory, .gitignore coverage, and safe-handling guidelines.

## Checkpoint

- Env var inventory documented; .env.example complete for all required vars
- No hardcoded secrets in codebase; .gitignore verified
- SECURITY_STUBS updated with secrets audit section

---

## Session 8.4.1 (source: session-8.4.1-planning.md)

### Goal

Inventory all environment variable usage across the project; validate .env.example completeness; ensure no hardcoded secrets. Document the env var inventory and safe-handling patterns. (Committed-files scan and .gitignore verification are Session 8.4.2.)

### Files

- `server/.env.example`, `server/.env.development`, `server/.env.production` — audit against usage
- Root `.env`, `.env.example` — if present; audit
- `server/src/**` — scan for process.env and config usage
- `client/src/**` — scan if any env usage (Vite import.meta.env)
- Any `*.config.*` or config loaders — ensure they read from env
- `server/SECURITY_STUBS.md` or equivalent — document env inventory

### Approach

1. Grep for `process.env`, `import.meta.env`, and config-loading patterns across server and client
2. Cross-check findings against .env.example; add missing vars (placeholders, no real values)
3. Scan for hardcoded API keys, passwords, tokens; replace with env vars if any found
4. Document env var inventory (required vs optional) and safe-handling patterns

### Checkpoint

- Env var inventory documented
- .env.example covers all required vars
- No hardcoded secrets in codebase

---

---

## Session 8.4.2 (source: session-8.4.2-planning.md)

### Goal

Verify .gitignore coverage for credential paths, scan tracked files for secrets (API keys, tokens, high-entropy strings), and document findings in SECURITY_STUBS. Session 8.4.1 completed env var inventory and .env.example; this session focuses on committed-file safety.

### Files

- `.gitignore` — audit coverage for .env*, credentials, token files
- `client/src/**`, `server/src/**` — tracked source to scan for secrets
- `server/docs/SECURITY_STUBS.md` — document committed-files scan findings
- Root and nested `*.config.*`, config loaders — verify no secrets in committed config

### Approach

1. **.gitignore verification:** Confirm .env, .env.*, .google-tokens.json and any other credential paths are excluded; add missing patterns if needed.
2. **Secrets scan:** Grep tracked files for known patterns (API key formats, bearer tokens, high-entropy strings, `password=`, `secret=`) and document findings or confirm clean.
3. **SECURITY_STUBS:** Add "Committed files scan" section with .gitignore coverage summary, scan methodology, and safe-handling guidelines for future commits.

### Checkpoint

- .gitignore verified; any missing credential patterns added
- Tracked files scanned; no secrets found or findings documented
- SECURITY_STUBS updated with committed-files scan section

---

---
