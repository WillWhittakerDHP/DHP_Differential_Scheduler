/**
 * Admin Relationship Metadata Router Helper Functions
 * 
 */

import type { RelationshipMetadataEntry } from '../../../utils/adminRelationshipMetadataComposer.js';
import { mapMetaFieldsToPayload } from '../../../utils/adminMetadataPayload.js';

/**
 * PATTERN: Transform metadata array to record format
PATTERN: Map array to record w...
 */
export function transformMetadataToRecord(metadata: RelationshipMetadataEntry[]): Record<string, unknown> {
  const metadataRecord: Record<string, unknown> = {}
  for (const meta of metadata) {
    metadataRecord[meta.relationshipKey] = mapMetaFieldsToPayload(meta);
  }
  return metadataRecord
}
