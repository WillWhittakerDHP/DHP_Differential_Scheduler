import type { BrightMlsPropertyResponse } from '../types/brightMls.js'
import type { PropertyFeatureMapping } from '../db/models/mappings/property_feature_mapping.js'
import { normalizeToArray } from '../utils/arrayNormalize.js'
import { PROPERTY_MATCH_TYPE } from './propertyMatchConstants.js'

interface FeatureMatchResult {
  blockInstanceId: string;
  confidence: number;
}

function getSourceValue(
  response: BrightMlsPropertyResponse,
  sourceField: string
): string[] | number | null {
  const val = (response as Record<string, unknown>)[sourceField]

  if (val == null) return null
  if (typeof val === 'number') return val
  const arr = normalizeToArray(val).map((v) =>
    typeof v === 'string' ? v : String(v)
  )
  return arr
}

function matchesNumericFeatureRaw(
  raw: number,
  matchType: string,
  matchValue: string | null
): boolean {
  if (matchType === 'greater_than' && matchValue != null) {
    const threshold = Number(matchValue)
    return !Number.isNaN(threshold) && raw > threshold
  }
  if (matchType === PROPERTY_MATCH_TYPE.EQUALS && matchValue != null) {
    return raw === Number(matchValue)
  }
  return matchType === PROPERTY_MATCH_TYPE.EXISTS
}

function stringArrayMatchExists(arr: string[]): boolean {
  return arr.length > 0
}

function stringArrayMatchContains(lower: string[], matchValue: string | null): boolean {
  if (!matchValue) return false
  return lower.some((s) => s.includes(matchValue.toLowerCase()))
}

function stringArrayMatchEquals(lower: string[], matchValue: string | null): boolean {
  if (!matchValue) return false
  return lower.includes(matchValue.toLowerCase())
}

const STRING_ARRAY_MATCHERS: Record<
  string,
  (arr: string[], lower: string[], matchValue: string | null) => boolean
> = {
  [PROPERTY_MATCH_TYPE.EXISTS]: (arr) => stringArrayMatchExists(arr),
  [PROPERTY_MATCH_TYPE.CONTAINS]: (_arr, lower, mv) => stringArrayMatchContains(lower, mv),
  [PROPERTY_MATCH_TYPE.EQUALS]: (_arr, lower, mv) => stringArrayMatchEquals(lower, mv),
}

function matchesStringArrayFeatureRaw(
  arr: string[],
  matchType: string,
  matchValue: string | null
): boolean {
  const lower = arr.map((s) => s.toLowerCase())
  const run = STRING_ARRAY_MATCHERS[matchType]
  return run ? run(arr, lower, matchValue) : false
}

function matches(
  raw: string[] | number | null,
  matchType: string,
  matchValue: string | null
): boolean {
  if (raw == null) {
    return false
  }
  if (typeof raw === 'number') {
    return matchesNumericFeatureRaw(raw, matchType, matchValue)
  }
  return matchesStringArrayFeatureRaw(raw, matchType, matchValue)
}

export function matchFeaturesToBlocks(
  response: BrightMlsPropertyResponse,
  mappingRows: PropertyFeatureMapping[]
): FeatureMatchResult[] {
  const results: FeatureMatchResult[] = [];
  const seen = new Set<string>();

  const sorted = [...mappingRows].sort((a, b) => b.priority - a.priority);

  for (const m of sorted) {
    if (!m.active) continue;

    const raw = getSourceValue(response, m.sourceField);
    if (!matches(raw, m.matchType, m.matchValue)) continue;

    const id = String(m.blockInstanceId);
    if (seen.has(id)) continue;
    seen.add(id);

    results.push({
      blockInstanceId: id,
      confidence: 1,
    });
  }

  return results;
}
