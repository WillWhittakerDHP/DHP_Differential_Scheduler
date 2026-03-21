/** Property feature match types (avoids hardcoded case strings in propertyFeatureMatcher). */
export const PROPERTY_MATCH_TYPE = {
  EXISTS: 'exists',
  CONTAINS: 'contains',
  EQUALS: 'equals',
} as const

export type PropertyMatchType = (typeof PROPERTY_MATCH_TYPE)[keyof typeof PROPERTY_MATCH_TYPE]
