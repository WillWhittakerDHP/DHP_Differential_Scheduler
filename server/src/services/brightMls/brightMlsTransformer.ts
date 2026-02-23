/**
 * Bright MLS Transformer
 *
 */

import type {
  BrightMlsPropertyResponse,
  PropertyEnrichmentResponse,
} from '../../types/brightMls.js';
import { mapFieldsToModel } from '../propertyFieldMapper.js';
import { matchFeaturesToBlocks } from '../propertyFeatureMatcher.js';
import type { PropertyFieldMapping } from '../../db/models/mappings/property_field_mapping.js';
import type { PropertyFeatureMapping } from '../../db/models/mappings/property_feature_mapping.js';

/**
 * Transform Bright MLS RESO response to PropertyEnrichmentResponse
 */
export function transformToPropertyEnrichment(
  response: BrightMlsPropertyResponse,
  fieldMappings: PropertyFieldMapping[],
  featureMappings: PropertyFeatureMapping[]
): PropertyEnrichmentResponse {
  const mapped = mapFieldsToModel(response, fieldMappings);
  const featureMatches = matchFeaturesToBlocks(response, featureMappings);

  return {
    mlsNumber: mapped.mlsNumber ?? null,
    squareFootage: mapped.squareFootage ?? null,
    bedrooms: mapped.bedrooms ?? null,
    bathrooms: mapped.bathrooms ?? null,
    foundationAccess: mapped.foundationAccess ?? null,
    additionalUnits: mapped.additionalUnits ?? null,
    suggestedBlockInstanceIds: featureMatches.map((m) => m.blockInstanceId),
  };
}
