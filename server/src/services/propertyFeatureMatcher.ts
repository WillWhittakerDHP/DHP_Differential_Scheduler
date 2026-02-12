/**
 * Property Feature Matcher
 *
 * LEARNING: Maps RESO feature fields to suggested block_instance IDs
 * WHY: Admin-configurable feature-to-block mappings (Pool, Deck, ADU)
 * PATTERN: match_type (exists, contains, equals, greater_than)
 */

import type { BrightMlsPropertyResponse } from '../types/brightMls.js';
import type { PropertyFeatureMapping } from '../db/models/mappings/property_feature_mapping.js';

export interface FeatureMatchResult {
  blockInstanceId: string;
  confidence: number;
}

function getSourceValue(
  response: BrightMlsPropertyResponse,
  sourceField: string
): string[] | number | null {
  const key = sourceField as keyof BrightMlsPropertyResponse;
  const val = response[key];

  if (val == null) return null;
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === 'string' ? v : String(v)));
  }
  if (typeof val === 'string') return [val];
  if (typeof val === 'number') return val;
  return null;
}

function matches(
  raw: string[] | number | null,
  matchType: string,
  matchValue: string | null
): boolean {
  if (raw == null) return matchType === 'exists' && false;

  if (typeof raw === 'number') {
    if (matchType === 'greater_than' && matchValue != null) {
      const threshold = Number(matchValue);
      return !Number.isNaN(threshold) && raw > threshold;
    }
    if (matchType === 'equals' && matchValue != null) {
      return raw === Number(matchValue);
    }
    return matchType === 'exists';
  }

  const arr = raw as string[];
  const lower = arr.map((s) => s.toLowerCase());

  switch (matchType) {
    case 'exists':
      return arr.length > 0;
    case 'contains':
      if (!matchValue) return false;
      return lower.some((s) => s.includes(matchValue.toLowerCase()));
    case 'equals':
      if (!matchValue) return false;
      return lower.includes(matchValue.toLowerCase());
    default:
      return false;
  }
}

/**
 * Match RESO features to block instances using DB mappings
 */
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
