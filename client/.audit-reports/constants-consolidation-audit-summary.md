# Constants Consolidation Audit Summary (Generated)

Generated from `.audit-reports/constants-consolidation-audit.json`.

- Constants files scanned: **14**
- Total exports scanned: **38**
- Consolidation groups: **45**
- Requiring review: **211**
- Allowed exceptions: 0

## Top 30 Consolidation Groups (ranked by score)

| Classification | Priority | Score | Description | Locations |
| --- | --- | ---: | --- | ---: |
| HOIST | P0 | 148 | Value 'client' defined in constants but used inline in 35 locations | 36 |
| HOIST | P0 | 92 | Value 'orderIndex' defined in constants but used inline in 21 locations | 22 |
| HOIST | P0 | 60 | Value 'standalone' defined in constants but used inline in 13 locations | 14 |
| HOIST | P0 | 56 | Value 'order_index' defined in constants but used inline in 12 locations | 13 |
| HOIST | P0 | 44 | Value 'new-' defined in constants but used inline in 9 locations | 10 |
| HOIST | P0 | 40 | Value 'Properties' defined in constants but used inline in 8 locations | 9 |
| HOIST | P0 | 32 | Value 'createdAt' defined in constants but used inline in 6 locations | 7 |
| HOIST | P0 | 28 | Value '00000000-0000-0000-0000-000000000001' defined in constants but used inline in 5 locations | 6 |
| HOIST | P0 | 28 | Value '00000000-0000-0000-0000-000000000002' defined in constants but used inline in 5 locations | 6 |
| HOIST | P0 | 28 | Value '00000000-0000-0000-0000-000000000003' defined in constants but used inline in 5 locations | 6 |
| HOIST | P0 | 28 | Value 'DESC' defined in constants but used inline in 5 locations | 6 |
| HOIST | P0 | 24 | Value '00000000-0000-0000-0000-000000000004' defined in constants but used inline in 4 locations | 5 |
| HOIST | P0 | 24 | Value 'availability_settings' defined in constants but used inline in 2 locations | 4 |
| HOIST | P1 | 16 | Identical string value 'availability_settings' in 2 locations | 2 |
| HOIST | P1 | 16 | Identical object structure for REQUIRED_FIELDS and REQUIRED_FIELDS | 2 |
| HOIST | P1 | 16 | Value 'Appointment not found' defined in constants but used inline in 2 locations | 3 |
| HOIST | P1 | 16 | Value '00000000-0000-0000-0000-000000000000' defined in constants but used inline in 2 locations | 3 |
| TEMPLATE | P1 | 15 | Structural pattern with keys: CREATE_UPDATE | 3 |
| HOIST | P1 | 12 | Value 'Failed to fetch business settings' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Failed to create business rule' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Failed to update business rule' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Failed to delete business rule' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Failed to update appointment' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Failed to create appointment' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'bookingMode' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Too many requests. Please try again in a moment.' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Invalid address lookup request.' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'Address not found.' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'An unexpected error occurred.' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value '1.0.0' defined in constants but used inline in 1 locations | 2 |

*...and 15 more groups. See full report for details.*

## Notes

- **HOIST**: Identical values that should be moved to shared constants
- **TEMPLATE**: Structural patterns that could use factory functions or base templates
- **ENUM**: Related values that should be grouped into enums or const objects
- **P0** (score >= 20): Immediate consolidation target
- **P1** (score >= 10): Should consolidate soon
- **P2** (score < 10): Nice to have
