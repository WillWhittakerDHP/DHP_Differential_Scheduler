# Constants Consolidation Audit Summary (Generated)

Generated from `.audit-reports/constants-consolidation-audit.json`.

- Constants files scanned: **3**
- Total exports scanned: **13**
- Consolidation groups: **16**
- Requiring review: **178**
- Allowed exceptions: 0

## Top 16 Consolidation Groups (ranked by score)

| Classification | Priority | Score | Description | Locations |
| --- | --- | ---: | --- | ---: |
| HOIST | P0 | 204 | Value 'Unknown error' defined in constants but used inline in 47 locations | 49 |
| HOIST | P0 | 140 | Value 'client' defined in constants but used inline in 33 locations | 34 |
| HOIST | P0 | 88 | Value 'orderIndex' defined in constants but used inline in 20 locations | 21 |
| HOIST | P0 | 60 | Value 'standalone' defined in constants but used inline in 13 locations | 14 |
| HOIST | P0 | 56 | Value 'order_index' defined in constants but used inline in 12 locations | 13 |
| HOIST | P0 | 44 | Value 'new-' defined in constants but used inline in 9 locations | 10 |
| HOIST | P0 | 40 | Value 'Properties' defined in constants but used inline in 8 locations | 9 |
| HOIST | P0 | 28 | Value 'Missing required fields' defined in constants but used inline in 5 locations | 6 |
| HOIST | P0 | 24 | Value 'createdAt' defined in constants but used inline in 4 locations | 5 |
| HOIST | P0 | 20 | Value 'DESC' defined in constants but used inline in 3 locations | 4 |
| HOIST | P1 | 16 | Identical string value 'Unknown error' in 2 locations | 2 |
| HOIST | P1 | 16 | Value '00000000-0000-0000-0000-000000000000' defined in constants but used inline in 2 locations | 3 |
| HOIST | P1 | 12 | Value 'bookingMode' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value '1.0.0' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'isStateControl and canHaveParts cannot both be true. They are mutually exclusive.' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'booking_mode' defined in constants but used inline in 1 locations | 2 |

## Notes

- **HOIST**: Identical values that should be moved to shared constants
- **TEMPLATE**: Structural patterns that could use factory functions or base templates
- **ENUM**: Related values that should be grouped into enums or const objects
- **P0** (score >= 20): Immediate consolidation target
- **P1** (score >= 10): Should consolidate soon
- **P2** (score < 10): Nice to have
