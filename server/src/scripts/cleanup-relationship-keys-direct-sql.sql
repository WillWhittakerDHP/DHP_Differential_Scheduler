-- Direct SQL to delete relationship keys from admin_primitive_metadata
-- Run this directly in your PostgreSQL client or via psql
-- 
-- LEARNING: Relationship keys should NOT be in primitive metadata
-- WHY: They belong in admin_relationship_metadata table only
-- PATTERN: Use PostgreSQL array syntax for efficient deletion

-- First, check what will be deleted
SELECT entity_type, entity_id, field_key
FROM admin_primitive_metadata
WHERE field_key = ANY(ARRAY[
  'validCascades',
  'validParts',
  'bookingCascades',
  'activeParts',
  'instanceComponents',
  'dependentInstanceOptions',
  'activeConstituents',
  'validConstituents'
]::text[])
ORDER BY entity_type, entity_id, field_key;

-- Then delete them
DELETE FROM admin_primitive_metadata
WHERE field_key = ANY(ARRAY[
  'validCascades',
  'validParts',
  'bookingCascades',
  'activeParts',
  'instanceComponents',
  'dependentInstanceOptions',
  'activeConstituents',
  'validConstituents'
]::text[]);

-- Verify deletion (should return 0 rows)
SELECT COUNT(*) as remaining_count
FROM admin_primitive_metadata
WHERE field_key = ANY(ARRAY[
  'validCascades',
  'validParts',
  'bookingCascades',
  'activeParts',
  'instanceComponents',
  'dependentInstanceOptions',
  'activeConstituents',
  'validConstituents'
]::text[]);
