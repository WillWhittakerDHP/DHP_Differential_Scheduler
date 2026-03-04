# Feature 9: Test Suite Setup — Feature Plan

**Feature:** Test Suite Setup
**Status:** Planning
**Created:** 2026-02-18
**Branch:** TBD
**Related:** `LAUNCH_CHECKLIST.md` Phase 3

---

## Overview

Expand the existing testing infrastructure to cover all critical paths before beta launch. The existing unit test suites (Vitest for client, Jest for server) provide a solid foundation. This feature adds E2E testing with Playwright, expands server integration tests, and enhances the CI pipeline with coverage reporting.

---

## Phase 9.1: Audit & Coverage Targets

**Status:** Not Started

### Objectives
- Run coverage reports for client (`npx vitest --coverage`) and server (`npx jest --coverage`)
- Identify critical paths with low or no coverage
- Define launch coverage targets (client: 80% branches, 90% functions/lines/statements; server: match client)
- Document coverage gaps and prioritize fixes

### Success Criteria
- Coverage report generated for both client and server
- Critical gaps identified and documented
- Coverage targets defined and agreed upon

---

## Phase 9.2: Playwright Setup

**Status:** Not Started

### Objectives
- Install and configure Playwright (`npm init playwright@latest`)
- Create base test fixtures (unauthenticated user, authenticated admin)
- Configure for development and staging URLs
- Create smoke tests (health check, all pages load)

### Proposed Structure
```
e2e/
├── playwright.config.ts
├── fixtures/
│   ├── base.ts
│   └── auth.ts
├── booking/
│   ├── happy-path.spec.ts
│   ├── validation.spec.ts
│   └── responsive.spec.ts
├── admin/
│   ├── shapes-crud.spec.ts
│   ├── instances-crud.spec.ts
│   └── relationships.spec.ts
└── smoke/
    ├── health.spec.ts
    └── pages-load.spec.ts
```

### Success Criteria
- Playwright installed and configured
- Base fixtures created
- Smoke tests passing locally

---

## Phase 9.3: E2E Tests for Critical Flows

**Status:** Not Started

### Objectives
- Booking wizard: full flow (user type → service → availability → confirm)
- Admin panel: CRUD operations on shapes/instances, relationship management
- Auth flow: magic link request → verify → session (when auth is built)
- Error states: API down, no availability
- Responsive behavior: mobile viewport tests

### Success Criteria
- All critical user flows covered by E2E tests
- Tests pass locally against development server
- Error states and edge cases tested

---

## Phase 9.4: Server Integration Tests

**Status:** Not Started

### Objectives
- Test full request lifecycle for each route (request → middleware → handler → DB → response)
- Mock Google Calendar and Maps API responses
- Test availability calculation end-to-end
- Test error handling paths (400, 404, 500 responses)
- Test auth middleware (when built)

### Success Criteria
- All major API routes have integration tests
- External APIs properly mocked
- Error handling verified for all routes

---

## Phase 9.5: CI Pipeline Enhancements

**Status:** Not Started

### Objectives
- Add Playwright E2E job to `.github/workflows/ci.yml`
- Upload test artifacts (screenshots, traces) on failure
- Add test coverage reporting to CI
- Consider coverage summary on PRs (GitHub Action)
- Optional: set up pre-commit hooks (husky + lint-staged)

### Target CI Pipeline
```
GitHub Actions CI
├── lint-client          (existing)
├── lint-server          (existing)
├── typecheck-client     (existing)
├── typecheck-server     (existing)
├── test-client          (existing — Vitest)
├── test-server          (existing — Jest + PostgreSQL)
├── build-client         (existing)
├── test-e2e             (NEW — Playwright)
├── coverage-report      (NEW — summary on PRs)
└── deploy-staging       (NEW — Render deploy on main)
```

### Success Criteria
- E2E tests run in CI on every push
- Test artifacts uploaded on failure
- Coverage reports generated in CI

---

## Dependencies

- Existing Vitest and Jest test infrastructure
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`)
- Authentication system (for authenticated test fixtures — Feature 10)
- Running development server for E2E tests

---

## Test Suite Architecture Reference

### Existing Test Infrastructure

| Layer | Tool | Location | Count | Coverage |
|-------|------|----------|-------|----------|
| Client Unit | Vitest | `client/src/**/*.test.ts` | 117 files | Thresholds: 80% branch, 90% func/line/stmt |
| Server Unit | Jest | `server/src/**/*.test.ts` | 15 files | Thresholds: 80% branch, 90% func/line/stmt |
| E2E | None | — | 0 | — |
| Static Analysis | TypeScript + ESLint | CI pipeline | N/A | Strict mode enabled |

### Test Quality Validation (Feature 12)

| Layer | Tool | Location | Purpose |
|-------|------|----------|---------|
| Mutation Testing | Stryker Mutator | `client/stryker.config.mjs` | Verifies tests catch real bugs |
| Property-Based Testing | fast-check | `client/src/**/*.property.test.ts` | Invariants for random inputs |
| Behavioral Alignment | Custom audit | `client/.scripts/test-alignment-audit.mjs` | Scores behavioral vs structural |
| Quality Dashboard | Custom script | `client/.scripts/test-quality-dashboard.mjs` | Unified summary |

### File Naming Convention

- Example-based unit tests: `*.test.ts` in `__tests__/` directories.
- Property-based tests: `*.property.test.ts` alongside unit tests (see Feature 12).

### E2E Structure (Proposed)

```
e2e/
├── playwright.config.ts
├── fixtures/ (base.ts, auth.ts)
├── booking/ (happy-path, validation, responsive)
├── admin/ (shapes-crud, instances-crud, relationships)
└── smoke/ (health, pages-load)
```

### Relationship Between Quality Layers

- **Coverage** — untested code paths.
- **Mutation score** — weak assertions (Feature 12).
- **Property-based** — edge cases in pure functions (Feature 12).
- **Alignment audit** — structural vs behavior-focused tests (Feature 12).

---

**Last Updated:** 2026-02-18
