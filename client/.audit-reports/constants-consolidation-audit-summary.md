# Constants Consolidation Audit Summary (Generated)

Generated from `.audit-reports/constants-consolidation-audit.json`.

- Constants files scanned: **23**
- Total exports scanned: **66**
- Consolidation groups: **7**
- Requiring review: **16**
- Allowed exceptions: 3

## Top 7 Consolidation Groups (ranked by score)

| Classification | Priority | Score | Description | Locations |
| --- | --- | ---: | --- | ---: |
| HOIST | P0 | 24 | Value 'DESC' defined in constants but used inline in 4 locations | 5 |
| HOIST | P0 | 24 | Value 'createdAt' defined in constants but used inline in 2 locations | 4 |
| HOIST | P1 | 12 | Value 'Enter' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'client' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'development' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'test' defined in constants but used inline in 1 locations | 2 |
| HOIST | P1 | 12 | Value 'production' defined in constants but used inline in 1 locations | 2 |

## Notes

- **HOIST**: Identical values that should be moved to shared constants
- **TEMPLATE**: Structural patterns that could use factory functions or base templates
- **ENUM**: Related values that should be grouped into enums or const objects
- **P0** (score >= 20): Immediate consolidation target
- **P1** (score >= 10): Should consolidate soon
- **P2** (score < 10): Nice to have
