/**
 * Beta Feedback Router Constants
 *
 * LEARNING: Centralized constants for beta feedback operations
 * WHY: Single source of truth for error messages and valid enum values
 * PATTERN: Const objects with categorized constants
 */

import type { FeedbackCategory, FeedbackSeverity, FeedbackStatus } from '../../../db/models/beta/beta_feedback.js';

export const ERROR_MESSAGES = {
  FETCH_ALL: 'Failed to fetch beta feedback',
  FETCH_ONE: 'Failed to fetch beta feedback item',
  NOT_FOUND: 'Beta feedback not found',
  CREATE: 'Failed to create beta feedback',
  UPDATE: 'Failed to update beta feedback',
  DELETE: 'Failed to delete beta feedback',
  FETCH_STATS: 'Failed to fetch beta feedback stats',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_CATEGORY: 'Invalid category',
  INVALID_SEVERITY: 'Invalid severity',
  INVALID_STATUS: 'Invalid status',
} as const;

export const VALID_CATEGORIES: FeedbackCategory[] = [
  'bug',
  'feature_request',
  'usability',
  'performance',
  'general',
];

export const VALID_SEVERITIES: FeedbackSeverity[] = ['low', 'medium', 'high', 'critical'];

export const VALID_STATUSES: FeedbackStatus[] = [
  'new',
  'triaged',
  'in_progress',
  'resolved',
  'wont_fix',
];

export const REQUIRED_FIELDS_CREATE = [
  'reporterName',
  'category',
  'severity',
  'title',
  'description',
] as const;
