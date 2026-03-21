# Feature 10: Testing & Quality Validation — Test Suite Setup

**Status:** 📋 Planning
**Feature Number:** 10
**Branch:** TBD
**Related:** `LAUNCH_CHECKLIST.md` Phase 3

---

## Overview

Establish a comprehensive, layered testing strategy covering unit tests, integration tests, and end-to-end (E2E) tests. This feature expands the existing test infrastructure (117 Vitest client tests, 15 Jest server tests) with Playwright E2E tests, expanded server integration tests, and CI pipeline enhancements. Covers Feature 10 Phases 10.1–10.4 and 10.7.

## Key Objectives

1. Set up Playwright for browser-level E2E testing
2. Write E2E tests for critical user flows (booking wizard, admin panel, auth)
3. Expand server integration tests (route lifecycle, mocked external APIs)
4. Add E2E testing and coverage reporting to GitHub Actions CI
5. Define and enforce coverage targets for launch readiness

## Testing Pyramid

```
        E2E Tests (Playwright)
       Browser-level user flows
──────────────────────────────────
      Integration Tests (Vitest/Jest)
     API routes, DB queries, composables
──────────────────────────────────
        Unit Tests (Vitest/Jest)
    Pure functions, transformers, utils
──────────────────────────────────
     Static Analysis (TypeScript, ESLint)
       Type checking, linting rules
```

## Existing Test Infrastructure

| Layer | Tool | Location | Count |
|-------|------|----------|-------|
| Client Unit | Vitest | `client/src/**/*.test.ts` | 117 files |
| Server Unit | Jest | `server/src/**/*.test.ts` | 15 files |
| E2E | None | — | 0 |
| Static Analysis | TypeScript + ESLint | CI pipeline | N/A |

## Phases (per PROJECT_PLAN.md)

- **Phase 10.1:** Audit existing coverage and define targets
- **Phase 10.2:** Set up Playwright and create test fixtures
- **Phase 10.3:** Write E2E tests for booking flow and admin panel
- **Phase 10.4:** Expand server integration tests
- **Phase 10.7:** CI pipeline enhancements (E2E job, coverage reporting)

## Related Documents

- **Feature Guide:** `test-suite-setup-feature-plan.md`
- **Launch Checklist:** `../../LAUNCH_CHECKLIST.md` (Phase 3 — detailed checklist items 3.1–3.10)
- **CI Configuration:** `../../.github/workflows/ci.yml`
- **Test Quality Validation (Phases 10.5–10.6):** `test-quality-validation-README.md`
- **PROJECT_PLAN.md:** Feature 10 — single source of truth

---

**Last Updated:** 2026-03-15
