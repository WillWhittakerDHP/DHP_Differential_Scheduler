# Type Similarity — Intentional Overlaps (Deferred)

These groups are documented as intentional or deferred per the type-similarity remediation plan. They are allowlisted in `audit-global-config.json` under `allowlists.type-similarity.specific` so the audit does not flag them for action.

| Group ID | Types | Rationale |
| --- | --- | --- |
| `sim-high_overlap-76c5e2a1d396` | `UseBlockInstanceFormReturn`, `UsePartInstanceFormReturn` | Parallel block/part form composable return types; unification would require a generic form-return abstraction. Deferred. |
| `sim-high_overlap-99828820f350` | `WizardState`, `WizardBlocksForBuilders` | Wizard state vs builder-focused slice; overlap from shared booking/line-item shape. Intentional separation of concerns. Deferred. |
| `sim-subset-f928ba1a3d99` | `RelationshipFieldType`, `DependencyImpact` | Shared `affectedEntities` / `affectedEntityKey` shape; different domains (form config vs dependency impact). Document only. Deferred. |

**Reference:** `.cursor/plans/type_similarity_remediation_d71816b7.plan.md` Phase D.
