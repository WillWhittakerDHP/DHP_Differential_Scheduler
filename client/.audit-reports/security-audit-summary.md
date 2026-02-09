# Security Audit Summary (Generated)

Generated from `.audit-reports/security-audit.json`.

## Summary

- Total errors: **11**
- Total warnings: **51**
- Files with issues: **19**

## Categories (sorted by priority)

| Category | Priority | Score | Errors | Warnings |
| --- | --- | ---: | ---: | ---: |
| Exposed Secrets | P0 | 255 | 0 | 51 |
| CSRF Protection | P0 | 120 | 10 | 0 |
| IDOR Vulnerabilities | P1 | 12 | 1 | 0 |
| Dependency Vulnerabilities | P2 | 0 | 0 | 0 |
| Security Configuration | P2 | 0 | 0 | 0 |
| Authentication Patterns | P2 | 0 | 0 | 0 |

## Files with Issues (sorted by priority)

| File | Priority | Score | Categories | Issues |
| --- | --- | ---: | --- | ---: |
| `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` | P0 | 66 | secrets | 22 |
| `server/src/config/googleOAuth.ts` | P0 | 54 | secrets | 18 |
| `server/src/scripts/fix-primitive-metadata-cleanup.mjs` | P0 | 54 | secrets | 18 |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | P0 | 40 | csrf, idor | 4 |
| `server/src/routes/internal/entities/entityBulkRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/scripts/manual-migrate-fieldmetadata.mjs` | P0 | 36 | secrets | 12 |
| `server/src/app.ts` | P0 | 24 | secrets | 8 |
| `server/src/api/api.routes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/external/calendarRoutes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/external/mapsRoutes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/internal/availabilityRouter.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | P0 | 20 | csrf | 2 |
| `server/src/scripts/backfill-input-config-from-selectable.mjs` | P0 | 18 | secrets | 6 |
| `server/src/scripts/check-specific-shape.mjs` | P0 | 18 | secrets | 6 |
| `server/src/scripts/fix-validConstituents.mjs` | P1 | 12 | secrets | 4 |
| `server/src/services/driveTimeCache.ts` | P1 | 12 | secrets | 4 |
| `server/src/scripts/check-layout-configs.mjs` | P2 | 6 | secrets | 2 |
| `server/src/scripts/fix-valid-events-render-as.mjs` | P2 | 6 | secrets | 2 |

## Notes

- This is a *signal* index. Use the full report for line-level matches and details: `client/.audit-reports/security-audit.md`.
- **P0**: Critical security issues (fix soon)
- **P1**: Important security issues (high leverage cleanup)
- **P2**: Low priority (best practices)
