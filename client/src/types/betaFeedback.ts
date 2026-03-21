
export type FeedbackCategory =
  | 'bug'
  | 'feature_request'
  | 'usability'
  | 'performance'
  | 'general';

export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackStatus =
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'wont_fix';

export interface BetaFeedback {
  id: string;
  reporterName: string;
  reporterEmail: string | null;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  pageUrl: string | null;
  browserInfo: string | null;
  screenSize: string | null;
  stepsToReproduce: string | null;
  expectedBehavior: string | null;
  actualBehavior: string | null;
  status: FeedbackStatus;
  resolutionNotes: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BetaFeedbackSubmission {
  reporterName: string;
  reporterEmail?: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  pageUrl?: string;
  browserInfo?: string;
  screenSize?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  tags?: string[];
}

export interface BetaFeedbackStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}

/** Base for filter fields (P2 type-similarity); BetaFeedback has same keys as required. */
export interface BetaFeedbackFiltersBase {
  status?: FeedbackStatus
  category?: FeedbackCategory
  severity?: FeedbackSeverity
}

export type BetaFeedbackFilters = BetaFeedbackFiltersBase
