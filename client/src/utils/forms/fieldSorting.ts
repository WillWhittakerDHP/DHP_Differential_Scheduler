
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export function sortFieldsByDisplayOrder<GE extends GlobalEntityKey>(
  fields: GlobalFieldKey<GE>[],
  metadata: Record<string, FieldMetadataEntry>
): GlobalFieldKey<GE>[] {
  // PATTERN: Return empty array if fields is falsy or not an array
  if (!fields || !Array.isArray(fields)) {
    return []
  }
  
  // WHY: Functional approach - pure function shouldn't mutate inputs
  // PATTERN: Spread operator creates new array
  return [...fields].sort((a, b) => {
    const metaA = metadata[String(a)]
    const metaB = metadata[String(b)]
    const rawA = metaA?.displayOrder
    const rawB = metaB?.displayOrder
    const orderA = rawA !== undefined && rawA !== null ? rawA : 0
    const orderB = rawB !== undefined && rawB !== null ? rawB : 0
    
    // PATTERN: Compare displayOrder values
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // PATTERN: Use localeCompare for string comparison
    return String(a).localeCompare(String(b))
  })
}
