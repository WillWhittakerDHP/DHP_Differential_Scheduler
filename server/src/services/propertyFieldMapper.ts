/**
 * Property Field Mapper
 *
 * LEARNING: Maps RESO response fields to PropertyDetails using DB-configured mappings
 * WHY: Admin-configurable field mappings (foundationAccess, additionalUnits)
 * PATTERN: Load active mappings, apply value_mapping and fallback_value
 */

import type { BrightMlsPropertyResponse } from '../types/brightMls.js';
import type { PropertyFieldMapping } from '../db/models/mappings/property_field_mapping.js';
import { mapFoundationType } from '../config/brightMlsFoundationMapping.js';

export interface PartialPropertyDetails {
  mlsNumber?: string | null;
  squareFootage?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits?: number | null;
}

/**
 * Map RESO response to Partial<PropertyDetails> using DB mappings and built-in defaults
 */
export function mapFieldsToModel(
  response: BrightMlsPropertyResponse,
  mappings: PropertyFieldMapping[]
): PartialPropertyDetails {
  const result: PartialPropertyDetails = {};

  // Built-in mappings (always applied first)
  result.mlsNumber =
    response.ListingId ?? response.ListingKey ?? null;
  if (result.mlsNumber && typeof result.mlsNumber !== 'string') {
    result.mlsNumber = String(result.mlsNumber);
  }

  const living = response.LivingArea ?? null;
  const above = response.AboveGradeFinishedArea ?? null;
  const below = response.BelowGradeFinishedArea ?? null;
  if (living != null && typeof living === 'number') {
    result.squareFootage = Math.round(living);
  } else if (above != null || below != null) {
    const sum = (Number(above) || 0) + (Number(below) || 0);
    result.squareFootage = sum > 0 ? Math.round(sum) : null;
  } else {
    result.squareFootage = null;
  }

  result.bedrooms =
    response.BedroomsTotal != null
      ? Math.round(Number(response.BedroomsTotal))
      : null;

  const full = response.BathroomsFull ?? 0;
  const half = response.BathroomsHalf ?? 0;
  const baths = Number(full) + Number(half) * 0.5;
  result.bathrooms = baths > 0 ? Math.round(baths * 100) / 100 : null;

  result.foundationAccess = mapFoundationType(response.FoundationDetails);

  // additionalUnits from UnitTypes/OtherStructures - simple count or ADU detection
  const unitTypes = toArray(response.UnitTypes);
  const otherStructs = toArray(response.OtherStructures);
  const aduKeywords = ['adu', 'accessory', 'in-law', 'guest', 'unit'];
  const hasAdu = [...unitTypes, ...otherStructs].some((s) =>
    aduKeywords.some((k) => s.toLowerCase().includes(k))
  );
  result.additionalUnits = hasAdu ? 1 : unitTypes.length > 0 ? unitTypes.length : null;

  // Apply DB mappings (override built-in when mapping exists)
  for (const m of mappings) {
    if (!m.active) continue;

    const raw = getSourceValue(response, m.sourceField);
    let mapped: string | number | null = null;

    if (m.valueMapping && typeof m.valueMapping === 'object') {
      const key = String(raw ?? '').toLowerCase().trim();
      const vm = m.valueMapping as Record<string, string | number>;
      mapped = key in vm ? vm[key] : (m.fallbackValue ?? null);
    } else {
      mapped = m.fallbackValue ?? raw;
    }

    if (m.targetField === 'foundationAccess') {
      result.foundationAccess = mapped as 'basement' | 'crawlspace' | 'slab' | null;
    } else if (m.targetField === 'additionalUnits') {
      result.additionalUnits =
        mapped != null ? Math.round(Number(mapped)) : null;
    }
  }

  return result;
}

function getSourceValue(
  response: BrightMlsPropertyResponse,
  sourceField: string
): string | number | null {
  const key = sourceField as keyof BrightMlsPropertyResponse;
  const val = response[key];
  if (Array.isArray(val)) {
    return val.length > 0 ? val[0] : null;
  }
  return val ?? null;
}

function toArray(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
