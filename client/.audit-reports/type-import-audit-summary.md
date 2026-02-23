**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Type-Import Audit Summary (Generated)

Generated from `client/.audit-reports/type-import-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 795 |
| value-import-from-type-only-file | 7 |
| type-used-as-value | 0 |
| Files with findings | 2 |

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 7 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| value-import-from-type-only-file | 7 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 12 | value-import-from-type-only-file | ../../types/brightMls.js BrightMlsPropertyResponse |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 12 | value-import-from-type-only-file | ../../types/brightMls.js BrightMlsODataResponse |
| `server/src/services/google/maps/mapsHelpers.ts` | 14 | value-import-from-type-only-file | ./mapsTypes.js AddressComponents |
| `server/src/services/google/maps/mapsHelpers.ts` | 14 | value-import-from-type-only-file | ./mapsTypes.js AutocompletePrediction |
| `server/src/services/google/maps/mapsHelpers.ts` | 14 | value-import-from-type-only-file | ./mapsTypes.js Coordinates |
| `server/src/services/google/maps/mapsHelpers.ts` | 14 | value-import-from-type-only-file | ./mapsTypes.js PlaceDetails |
| `server/src/services/google/maps/mapsHelpers.ts` | 14 | value-import-from-type-only-file | ./mapsTypes.js RouteLocation |

## Top 2 files (by score)

| File | Score |
| --- | ---: |
| `server/src/services/google/maps/mapsHelpers.ts` | 10 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 4 |

## Notes

- Full report: `client/.audit-reports/type-import-audit.md`. value-import-from-type-only-file: importing a value from a file that only exports types. type-used-as-value: symbol imported with "import type" but used in value position.
