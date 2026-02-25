# Type-Import Audit (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


## Summary

- Files scanned: **1057**
- value-import-from-type-only-file: **7**
- type-used-as-value: **0**

## value-import-from-type-only-file

| File | Line | Specifier | Symbol | Source |
| --- | ---: | --- | --- | --- |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 3 | `../../types/brightMls.js` | BrightMlsPropertyResponse | `server/src/types/brightMls.ts` |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 3 | `../../types/brightMls.js` | BrightMlsODataResponse | `server/src/types/brightMls.ts` |
| `server/src/services/google/maps/mapsHelpers.ts` | 7 | `./mapsTypes.js` | AddressComponents | `server/src/services/google/maps/mapsTypes.ts` |
| `server/src/services/google/maps/mapsHelpers.ts` | 7 | `./mapsTypes.js` | AutocompletePrediction | `server/src/services/google/maps/mapsTypes.ts` |
| `server/src/services/google/maps/mapsHelpers.ts` | 7 | `./mapsTypes.js` | Coordinates | `server/src/services/google/maps/mapsTypes.ts` |
| `server/src/services/google/maps/mapsHelpers.ts` | 7 | `./mapsTypes.js` | PlaceDetails | `server/src/services/google/maps/mapsTypes.ts` |
| `server/src/services/google/maps/mapsHelpers.ts` | 7 | `./mapsTypes.js` | RouteLocation | `server/src/services/google/maps/mapsTypes.ts` |

## Files by finding count (score)

| File | Score |
| --- | ---: |
| `server/src/services/google/maps/mapsHelpers.ts` | 10 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 4 |
