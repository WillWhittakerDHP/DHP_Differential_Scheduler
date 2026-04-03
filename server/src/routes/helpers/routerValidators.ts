export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }
