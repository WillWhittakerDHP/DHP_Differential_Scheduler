export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate that required fields are present and non-nullish (DUPLICATION P0 extraction).
 * Shared by admin-metadata, admin-primitive-metadata, and admin-relationship-metadata validators.
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: readonly string[],
  errorMessage: string
): ValidationResult {
  const missingFields: string[] = []
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      missingFields.push(field)
    }
  }
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: errorMessage,
      details: { required: [...requiredFields], missing: missingFields },
    }
  }
  return { valid: true }
}
