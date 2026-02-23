# Feature 13: Guided Beta Testing

**Feature Number:** 13
**Status:** 📋 Planning
**Created:** 2026-02-18
**Branch:** TBD
**Depends On:** BETA_LAUNCH_CHECKLIST.md Phase 6A; Feature 10 (Authentication) for user identity and task assignment

---

## Overview

Interactive, in-app guided testing: welcome beta testers, assign randomized test tasks across feature areas, collect structured feedback per task, and provide analytics on test coverage across the tester pool. Database-driven so tasks can be distributed for coverage and linked to feedback.

## Key Objectives

1. **Database:** beta_test_tasks (pool), beta_test_assignments (who got what), beta_test_addresses (curated properties).
2. **Server:** Assignment algorithm (weighted by coverage/variety/difficulty), GET my-tasks, PATCH task status, admin CRUD and coverage stats.
3. **Client:** BetaTestingGuide.vue (floating panel), BetaTestItem.vue, useBetaTesting composable, feedback linkage with BetaFeedbackModal, admin coverage view.

## Related Documents

- **Feature Guide (full spec):** `feature-guided-beta-testing-guide.md`
- **Checklist (todo layer):** `../../../BETA_LAUNCH_CHECKLIST.md` — Phase 6A
- **Authentication:** `../authentication/` — Feature 10
- **Beta Feedback:** `../beta-feedback/` — Feature 5 (feedback modal/widget)

---

**Last Updated:** 2026-02-18
