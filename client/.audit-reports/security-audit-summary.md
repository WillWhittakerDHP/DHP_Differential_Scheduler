# Security Audit Summary (Generated)

Generated from `.audit-reports/security-audit.json`.

## Summary

- Total errors: **10**
- Total warnings: **0**
- Files with issues: **7**

## Categories (sorted by priority)

| Category | Priority | Score | Errors | Warnings |
| --- | --- | ---: | ---: | ---: |
| CSRF Protection | P0 | 108 | 9 | 0 |
| IDOR Vulnerabilities | P1 | 12 | 1 | 0 |
| Dependency Vulnerabilities | P2 | 0 | 0 | 0 |
| Exposed Secrets | P2 | 0 | 0 | 0 |
| Security Configuration | P2 | 0 | 0 | 0 |
| Authentication Patterns | P2 | 0 | 0 | 0 |

## Files with Issues (sorted by priority)

| File | Priority | Score | Categories | Issues |
| --- | --- | ---: | --- | ---: |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | P0 | 40 | csrf, idor | 4 |
| `server/src/routes/internal/entities/entityBulkRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/api/api.routes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/external/mapsDebugRoutes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/internal/availabilityRouter.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | P0 | 20 | csrf | 2 |

## Notes

- This is a *signal* index. Use the full report for line-level matches and details: `client/.audit-reports/security-audit.md`.
- **P0**: Critical security issues (fix soon)
- **P1**: Important security issues (high leverage cleanup)
- **P2**: Low priority (best practices)
