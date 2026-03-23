# Plan: task 7.3.2.1 — Magic link delivery abstraction

## Contract
- **Tier:** task | **ID:** 7.3.2.1
- **Scope:** One module that **delivers** or **records** a magic-link message (recipient + human-readable body). **No** HTTP routes, **no** `issueMagicLinkForEmail`, **no** verify URL builder — those are **7.3.2.2** / **7.3.2.3**.
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
Session **7.3.2** planning is locked; **7.3.1** provides `issueMagicLinkForEmail`. This task only adds **how** the link reaches the user in dev vs future prod mail.

## Goal
Add **`sendMagicLinkDelivery`** (name may vary) as the **single entry** for outbound magic-link notifications: **`to`** (email), **`subject`**, **`textBody`** (includes URL line). **Default / local dev:** **`createLogger`** at **info** with a **stable message id** and **redacted** body (never log full URL token — truncate query value or replace with `[REDACTED]`). **Optional env** (e.g. `MAGIC_LINK_DELIVERY_MODE=log|smtp`): if **`smtp`** is chosen but no mail library exists in **`server/package.json`**, **log a warn once** and **fall back to log mode** (no silent noop). Document vars in **`server/.env.example`**.

## Files
- **New:** `server/src/auth/magicLinkDelivery.ts`
- **Update:** `server/.env.example` (comments only; no secrets)
- **Reference:** `server/src/utils/logger.ts`

## Approach
1. Export **`sendMagicLinkDelivery(input: { to: string; subject: string; textBody: string }): Promise<void>`** with explicit return type.
2. Implement **`redactMagicLinkBodyForLogs(text: string): string`** — replace `token=` / similar query values with a placeholder (regex or URL-parse safe for our link shape).
3. Branch on env: **`log`** path logs structured fields `{ to, subject, bodyPreview: redacted }`; future **`smtp`** branch is a **stub** that warns and delegates to log until Phase 7.3+ adds a real transport.
4. No new npm dependencies in this task.

## Checkpoint
- Calling the helper in isolation produces visible **info** logs in dev without printing a full magic-link secret.
- Misconfiguration (e.g. invalid mode) is **warned**, not swallowed.

---
## Design Before Execute (pseudocode)

```
sendMagicLinkDelivery({ to, subject, textBody }):
  mode <- process.env.MAGIC_LINK_DELIVERY_MODE ?? 'log'
  if mode == 'smtp':
    logger.warn('SMTP not implemented; using log delivery')
    mode <- 'log'
  if mode == 'log':
    logger.info('magic_link.delivery.log', { to, subject, bodyPreview: redactMagicLinkBodyForLogs(textBody) })
```

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
