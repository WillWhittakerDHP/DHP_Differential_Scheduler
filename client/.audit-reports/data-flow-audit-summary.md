**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Data Flow Audit Summary (Generated)

Generated from `client/.audit-reports/data-flow-audit.json`.

- Requiring review: **11**
- Allowed: **0**

## Top 25 files

| File | Count | Priority |
| --- | ---: | --- |
| `server/src/routes/helpers/requestHelpers.ts` | 2 | P2 |
| `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` | 2 | P2 |
| `server/src/routes/external/calendarRoutes.ts` | 1 | P2 |
| `server/src/routes/external/googleOauthRoutes.ts` | 1 | P2 |
| `server/src/routes/external/mapsRoutes.ts` | 1 | P2 |
| `server/src/routes/external/oauthCallbackRouter.ts` | 1 | P2 |
| `server/src/routes/external/propertyEnrichmentRoutes.ts` | 1 | P2 |
| `server/src/routes/internal/properties/propertyCrudRouter.ts` | 1 | P0 |
| `server/src/routes/internal/relationships/relationshipInstanceComponentRouter.ts` | 1 | P2 |
