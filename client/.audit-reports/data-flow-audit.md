**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Data Flow Validation Audit (Generated)

Generated at: 2026-02-20T16:44:11.875Z

## Summary

- Total allowed: **0**
- Requiring review: **10**

## Files with potential unvalidated input

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `server/src/routes/external/calendarRoutes.ts` | reqBodyUnvalidated | 75 | } = req.body; |
| `server/src/routes/external/googleOauthRoutes.ts` | reqQueryUnvalidated | 50 | const { code, error } = req.query; |
| `server/src/routes/external/mapsRoutes.ts` | reqQueryUnvalidated | 65 | const { input, sessionToken } = req.query |
| `server/src/routes/external/oauthCallbackRouter.ts` | reqQueryUnvalidated | 37 | logger.debug('Query params:', JSON.stringify(req.q |
| `server/src/routes/external/propertyEnrichmentRoutes.ts` | reqQueryUnvalidated | 61 | const addressParam = req.query.address; |
| `server/src/routes/helpers/requestHelpers.ts` | reqParamsUnvalidated | 4 | * WHY: Express typings (and runtime) can give req. |
| `server/src/routes/helpers/requestHelpers.ts` | reqQueryUnvalidated | 4 | * WHY: Express typings (and runtime) can give req. |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | reqParamsUnvalidated | 31 | const { blockInstanceId, annotationId } = req.para |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | reqBodyUnvalidated | 32 | const { userTypeBlockInstanceId } = req.body |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | reqBodyUnvalidated | 33 | const orderIndex = req.body.orderIndex ?? req.body |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

- (no exceptions configured)
