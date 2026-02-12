/**
 * Beta Feedback Validators
 *
 * LEARNING: Request validation for beta feedback create/update
 * WHY: Ensures required fields and enum values before hitting the database
 * PATTERN: Pure functions returning ValidationResult
 */

import type { ValidationResult } from '../../helpers/routerValidators.js';
import {
  ERROR_MESSAGES,
  REQUIRED_FIELDS_CREATE,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  VALID_STATUSES,
} from './betaFeedbackConstants.js';

interface CreateBody {
  reporterName?: unknown;
  reporterEmail?: unknown;
  category?: unknown;
  severity?: unknown;
  title?: unknown;
  description?: unknown;
  pageUrl?: unknown;
  browserInfo?: unknown;
  screenSize?: unknown;
  stepsToReproduce?: unknown;
  expectedBehavior?: unknown;
  actualBehavior?: unknown;
  tags?: unknown;
}

interface UpdateBody {
  status?: unknown;
  resolutionNotes?: unknown;
}

function validateRequiredFields(body: CreateBody, method: 'create' | 'update'): ValidationResult {
  if (method !== 'create') {
    return { valid: true };
  }
  const missing = REQUIRED_FIELDS_CREATE.filter((key) => {
    const value = body[key as keyof CreateBody];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });
  if (missing.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      details: { missing },
    };
  }
  return { valid: true };
}

function validateCategory(category: unknown): ValidationResult {
  if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CATEGORY };
  }
  return { valid: true };
}

function validateSeverity(severity: unknown): ValidationResult {
  if (typeof severity !== 'string' || !VALID_SEVERITIES.includes(severity as (typeof VALID_SEVERITIES)[number])) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_SEVERITY };
  }
  return { valid: true };
}

function validateStatus(status: unknown): ValidationResult {
  if (typeof status !== 'string' || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_STATUS };
  }
  return { valid: true };
}

export function validateCreateBody(body: unknown): ValidationResult {
  const b = body as CreateBody;
  const required = validateRequiredFields(b, 'create');
  if (!required.valid) return required;
  const cat = validateCategory(b.category);
  if (!cat.valid) return cat;
  const sev = validateSeverity(b.severity);
  if (!sev.valid) return sev;
  return { valid: true };
}

export function validateUpdateBody(body: unknown): ValidationResult {
  const b = body as UpdateBody;
  if (b.status !== undefined) {
    const statusResult = validateStatus(b.status);
    if (!statusResult.valid) return statusResult;
  }
  return { valid: true };
}
