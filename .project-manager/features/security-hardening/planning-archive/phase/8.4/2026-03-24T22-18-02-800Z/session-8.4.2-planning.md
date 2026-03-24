<!-- harness-planning-rollup tier=session id=8.4.2 consolidatedAt=2026-03-24T22:18:02.789Z -->

# Consolidated planning: session 8.4.2

## Session 8.4.2 (parent)

## Goal

Verify .gitignore coverage for credential paths, scan tracked files for secrets (API keys, tokens, high-entropy strings), and document findings in SECURITY_STUBS. Session 8.4.1 completed env var inventory and .env.example; this session focuses on committed-file safety.

## Files

- `.gitignore` — audit coverage for .env*, credentials, token files
- `client/src/**`, `server/src/**` — tracked source to scan for secrets
- `server/docs/SECURITY_STUBS.md` — document committed-files scan findings
- Root and nested `*.config.*`, config loaders — verify no secrets in committed config

## Approach

1. **.gitignore verification:** Confirm .env, .env.*, .google-tokens.json and any other credential paths are excluded; add missing patterns if needed.
2. **Secrets scan:** Grep tracked files for known patterns (API key formats, bearer tokens, high-entropy strings, `password=`, `secret=`) and document findings or confirm clean.
3. **SECURITY_STUBS:** Add "Committed files scan" section with .gitignore coverage summary, scan methodology, and safe-handling guidelines for future commits.

## Checkpoint

- .gitignore verified; any missing credential patterns added
- Tracked files scanned; no secrets found or findings documented
- SECURITY_STUBS updated with committed-files scan section

---

## Task 8.4.2.1 (source: task-8.4.2.1-planning.md)

### Goal

Audit .gitignore for credential-path coverage, run a pattern-based secrets scan on tracked files, and record findings for Task 8.4.2.2 to fold into SECURITY_STUBS.

### Files

- `.gitignore` — audit and update if missing credential patterns
- `client/src/**`, `server/src/**` — grep scan targets (exclude node_modules, dist via git ls-files)
- `server/docs/SECURITY_STUBS.md` — add "Committed files scan — results" subsection with .gitignore coverage and scan findings

### Approach

1. **.gitignore audit:** Verify .env, .env.*, .google-tokens.json, mcp.json, gmail-mcp-server; add any missing credential paths from env inventory.
2. **Secrets scan:** Use `git ls-files` + grep for patterns: `(api[_-]?key|secret|password|token|bearer)\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}`, `AIza[0-9A-Za-z-_]{35}`, `sk-[a-zA-Z0-9]{20,}`; exclude .env.example and docs that document patterns. Record matches or "No findings."
3. **Document results:** Add subsection under SECURITY_STUBS with .gitignore coverage list and scan results (clean or findings with file:line).

### Checkpoint

- .gitignore audited and updated if needed
- Scan completed; findings recorded
- SECURITY_STUBS has "Committed files scan — results" with coverage + scan outcome
---

---

## Task 8.4.2.2 (source: task-8.4.2.2-planning.md)

### Goal

Add safe-handling guidelines for committed-file security to SECURITY_STUBS. Task 8.4.2.1 added .gitignore coverage and scan results; this task adds guidelines for future commits and periodic re-scans.

### Files

- `server/docs/SECURITY_STUBS.md` — add guidelines subsection under Committed files scan

### Approach

1. **Guidelines subsection:** Under "Committed files scan — results", add "Safe-handling guidelines" with: pre-commit checklist (no API keys/tokens in source), how to add new credential paths to .gitignore, when to re-run the scan (e.g. before phase/session end or when adding new integrations).
2. **Concrete guidance:** Document patterns to avoid (hardcoded keys, literal tokens), reference .env.example for required vars, and a one-liner or short script to run a quick grep scan.

### Checkpoint

- SECURITY_STUBS has "Safe-handling guidelines" subsection with pre-commit checklist and re-scan guidance
---

---
