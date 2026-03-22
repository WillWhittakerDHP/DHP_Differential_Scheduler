# WorkProfile Design

**Tier** answers who owns the work and where it cascades. **WorkProfile** answers what kind of work this is.

## Responsibility Split

| Axis | Owner | Purpose |
|------|-------|---------|
| Orchestration | Tier | Cascade, status, control-doc, branch hierarchy |
| Work classification | WorkProfile | Context packs, planning guidance, decomposition intensity |

## WorkProfile Schema

- **executionIntent:** plan | design | implement | refactor | audit_fix | verify | document
- **actionType:** architecture_decision | decomposition | localized_change | workflow_bug_fix | governance_remediation | …
- **scopeShape:** architectural | cross_cutting | contract_level | file_local | snippet_level | tier_document
- **governanceDomains:** component | composable | function | type | docs | workflow | …
- **contextPack:** architecture_decision_pack | workflow_bug_fix_pack | audit_remediation_pack | …
- **decompositionMode:** light | moderate | explicit

## Key Modules

- `.cursor/commands/harness/work-profile.ts` — types
- `.cursor/commands/harness/work-profile-defaults.ts` — tier+action → default profile
- `.cursor/commands/harness/work-profile-classifier.ts` — rules engine (reasonCode overrides)
- `.cursor/commands/harness/work-profile-rules.ts` — decompositionMode derivation
- `.cursor/commands/harness/work-profile-context.ts` — WorkProfile → context artifacts
- `.cursor/commands/harness/governance-domain-map.ts` — governanceDomains → playbooks, audits

## Document Roles

- **Planning docs:** Advisory intake and inheritance. Contain Work Profile section. Not the authoritative decomposition artifact.
- **Guides:** Authoritative for current-tier decomposition. Own the direct child-unit list.
- **Task planning artifacts:** Executable work contracts.

## Boundary

`WorkflowCommandContext` resolves scope. `WorkProfile` classifies work. Do not conflate them.

**Scope and branch resolution:** `WorkflowCommandContext.scope` is populated from `.project-manager/.tier-scope` via `readTierScope()` when context is built with **`contextFromParams`** (which uses **`resolveWorkflowScope`**). Tier configs use `scope` (e.g. `ctx.scope?.phase?.branch`, `ctx.scope?.phase?.slug`) for deterministic branch names; session branches are created from the phase branch, not the feature branch. See Harness Charter §7.3 (TierScopeSnapshot, current implementation), §16 (compatibility), and `.project-manager/HARNESS_PLAYBOOK_ALIGNMENT.md`.
