**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Data Flow Validation Audit (Generated)

Generated at: 2026-02-23T18:12:58.786Z

## Summary

- Total allowed: **0**
- Requiring review: **9**

## Files with potential unvalidated input

| File | Rule | Line | Snippet |
| --- | --- | ---: | --- |
| `server/src/routes/external/calendarRoutes.ts` | reqBodyUnvalidated | 62 | } = req.body; |
| `server/src/routes/external/googleOauthRoutes.ts` | reqQueryUnvalidated | 28 | const { code, error } = req.query; |
| `server/src/routes/external/mapsRoutes.ts` | reqQueryUnvalidated | 56 | const { input, sessionToken } = req.query |
| `server/src/routes/external/oauthCallbackRouter.ts` | reqQueryUnvalidated | 22 | logger.debug('Query params:', JSON.stringify(req.q |
| `server/src/routes/external/propertyEnrichmentRoutes.ts` | reqQueryUnvalidated | 49 | const addressParam = req.query.address; |
| `server/src/routes/helpers/requestHelpers.ts` | reqParamsUnvalidated | 6 | const raw = req.params[key] |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | reqParamsUnvalidated | 15 | const { blockInstanceId, annotationId } = req.para |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | reqBodyUnvalidated | 16 | const { userTypeBlockInstanceId } = req.body |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | reqBodyUnvalidated | 18 | const orderIndex = req.body.orderIndex ?? req.body |

## Allowed Exceptions (for transparency)

These items matched audit rules but have documented justifications.
Review periodically to ensure exceptions are still valid.

- (no exceptions configured)
