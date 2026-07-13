/**
 * Entity schema default field sets for dehydrate/serialization.
 * WHY: Metadata may incorrectly mark fields as not required; database schema is source of truth.
 */

export const ENTITY_SCHEMA_DEFAULTS = {
  REQUIRED_BOOLEANS: {
    partInstance: ['active', 'zeroOutPart'],
    blockInstance: ['composite', 'differential', 'preClosing', 'requiresUnitNumber'],
    blockShape: [],
    partShape: [],
  },
  NULLABLE_BOOLEANS: {
    partInstance: [] as string[],
    blockInstance: [],
    blockShape: [],
    partShape: [],
  },
  REQUIRED_NUMBERS: {
    partInstance: ['baseFee', 'feePerUnit', 'baseTime', 'timePerUnit'],
    blockInstance: [],
    blockShape: [],
    partShape: [],
  },
} as const
