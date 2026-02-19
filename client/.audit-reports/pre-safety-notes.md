# Pre-safety audit notes

`npm run audit:pre-safety` runs error-handling, deprecation, and security audits.

**All audit allowlists** live in [audit-global-config.json](audit-global-config.json) under `allowlists` (one key per audit id). Per-audit config files hold only non-allowlist options (e.g. priorities, thresholds).

## Allowlist config location

- **Single source of truth:** `client/.audit-reports/audit-global-config.json` → `allowlists.<auditId>`
- Error-handling, deprecation, and other audits use `loadCentralAllowlist(auditType)` from `audit-exceptions.mjs`.

Reports are generated in this directory (`error-handling-audit.md`, `deprecation-audit.md`, and summaries).
