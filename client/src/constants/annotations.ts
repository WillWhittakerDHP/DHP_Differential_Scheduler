/**
 * WHY: Annotation Constants

LEARNING: Annotation configurations define annotation types (descriptions, tooltips, etc.)
WHY: Type-safe annotation definitions with metadata
PATTERN: Const object with annotation metadata, following RELATIONSHIP_KEYS pattern

Annotations are UI metadata that can be attached to entities (currently descriptions
attached to block instances)
 */
export const ANNOTATION_KEYS = {
  descriptions: {
    backendName: 'descriptions',
    frontendKey: 'descriptions',
    // Descriptions are attached to block instances via BlockInstanceDescription through-table
  },
} as const;

/**
 * Annotation key type
 * LEARNING: Derived from ANNOTATION_KEYS object keys
 * WHY: Type-safe annotation key references
 * PATTERN: keyof typeof pattern for type extraction
 */
export type GlobalAnnotationKey = keyof typeof ANNOTATION_KEYS;


