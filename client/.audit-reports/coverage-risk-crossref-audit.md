# Coverage-Risk Crossref Audit (Generated)

Generated at: 2026-02-11T04:10:08.413Z

## Summary

- High fan-in untested: **9**
- High fan-in tested: **10**
- Coverage of critical files (fan-in ≥ 20): **53%**
- Risk files (score ≥ 15): **11**

## Top risk files (high fan-in, no or low coverage)

| File | Fan-in | Has test | Exports | Risk score | Priority |
| --- | ---: | --- | ---: | ---: | --- |
| `client/src/constants/entities.ts` | 126 | No | 0 | 189 | P0 |
| `client/src/types/entities.ts` | 126 | No | 0 | 189 | P0 |
| `client/src/constants/primitives.ts` | 76 | No | 0 | 114 | P0 |
| `client/src/types/appointment.ts` | 48 | No | 0 | 72 | P0 |
| `client/src/constants/entityFieldConstants.ts` | 40 | No | 0 | 60 | P0 |
| `client/src/types/entityMetadata.ts` | 34 | No | 0 | 51 | P0 |
| `client/src/components/booking/types/selectionCardTypes.ts` | 32 | No | 0 | 48 | P0 |
| `client/src/types/datetime.ts` | 29 | No | 5 | 44 | P0 |
| `client/src/utils/api` | 25 | No | 0 | 38 | P0 |
| `client/src/utils/logger.ts` | 61 | Yes | 2 | 18 | P1 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | 53 | Yes | 1 | 16 | P1 |
