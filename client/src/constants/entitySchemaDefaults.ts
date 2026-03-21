/**
 * Entity schema default field sets for dehydrate/serialization.
 * WHY: Metadata may incorrectly mark fields as not required; database schema is source of truth.
 */

export const ENTITY_SCHEMA_DEFAULTS = {
  REQUIRED_BOOLEANS: {
    partInstance: ['active', 'zeroOutPart'],
    blockInstance: ['active', 'composite', 'differential', 'preClosing', 'allowMultiple', 'requiresUnitNumber'],
    blockShape: ['composable', 'canHaveParts', 'isStateControl'],
    partShape: [],
  },
  NULLABLE_BOOLEANS: {
    partInstance: [] as string[],
    blockInstance: [],
    blockShape: [],
    partShape: [],
  },
  REQUIRED_NUMBERS: {
    partInstance: ['baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime'],
    blockInstance: ['baseSqFt'],
    blockShape: [],
    partShape: [],
  },
} as const
