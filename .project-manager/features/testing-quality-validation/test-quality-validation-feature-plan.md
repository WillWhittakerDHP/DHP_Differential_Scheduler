# Feature 12: Test Quality Validation — Feature Plan

**Feature:** Test Quality Validation
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 3A

---

## Goal

Ensure that tests verify **desired behavior**, not just that code runs without crashing. Traditional code coverage answers "was this line executed?" — test quality validation answers "would my tests catch a real bug?"

**Why This Matters:** A codebase can have 100% code coverage but a 30% mutation score — meaning tests touched every line but didn't actually check whether those lines produced correct results. This phase adds three layers: mutation testing (Stryker), property-based testing (fast-check), and a behavioral alignment audit.

---

## Architecture

```
Test Quality Layers (supplements existing testing pyramid)
────────────────────────────────────────────────────────────

  LAYER 1: Mutation Testing (Stryker Mutator)
  Introduces small bugs ("mutants") into source; verifies tests catch them.
  Measures "mutation score" — % of bugs your tests would detect.

  LAYER 2: Property-Based Testing (fast-check)
  Generates random inputs; verifies invariants hold. Finds edge cases.

  LAYER 3: Behavioral Alignment Audit (scripted)
  Checklist per test file: behavioral naming, negative assertions,
  specific values, preconditions. Grades A–D.

Relationship:
  Static Analysis (TypeScript, ESLint)  → "Does it compile?"
  Unit Tests (Vitest)                   → "Does it run?"
  Test Quality Validation (THIS)      → "Does it catch bugs?"
  Integration / E2E                    → "Do parts / user flow work?"
```

---

## Phase 12.1: Mutation Testing (Stryker)

- [ ] **3A.1** Install Stryker Mutator with Vitest plugin (`client/`): `npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker`

- [ ] **3A.2** Create `client/stryker.config.mjs` — testRunner: 'vitest', checkers: ['typescript'], tsconfigFile: 'tsconfig.json', mutate: composables/booking, useBookingWizard, utils/transformers, utils/booking (exclude __tests__, *.test.ts, *.spec.ts, mocks, factories), reporters: html, clear-text, progress, htmlReporter fileName: '.mutation-reports/mutation-report.html', thresholds: high 80, low 60, break 50, concurrency: 2, timeoutMS: 30000, timeoutFactor: 1.5. (Full config: BETA_LAUNCH_CHECKLIST.md Phase 3A.2.)

- [ ] **3A.3** Add npm scripts to `client/package.json`: `test:mutate`, `test:mutate:booking`, `test:mutate:transformers`, `test:mutate:utils`. (Exact script block: BETA_LAUNCH_CHECKLIST.md Phase 3A.3.)

- [ ] **3A.4** Run initial Stryker on transformer primitives: `npx stryker run --mutate 'src/utils/transformers/transformerPrimitives.ts'`. Use report to identify killed vs survived vs no-coverage; fix surviving mutants by strengthening assertions (not by changing source).

- [ ] **3A.5** Run Stryker on booking composables: `npm run test:mutate:booking`. Priority: useWizardFilteredOptions, useTimeSlotCalculations, useStepValidation, useComputedAvailability. Review `.mutation-reports/mutation-report.html`.

- [ ] **3A.6** Fix surviving mutants: add or strengthen test assertions so mutants are killed; do not modify source to make mutants die.

- [ ] **3A.7** Define mutation score targets: transformer primitives 90% (stretch 95%), booking composables 70% (80%), booking utilities 80% (90%), overall 70% (80%). Document in plan or README.

- [ ] **3A.8** Add `.mutation-reports/` to `client/.gitignore`.

---

## Phase 12.2: Property-Based Testing (fast-check)

- [ ] **3A.9** Install fast-check: `cd client && npm install --save-dev fast-check`. Use inside Vitest `it()` blocks.

- [ ] **3A.10** Write property-based tests for transformer primitives. Create `client/src/utils/transformers/__tests__/transformerPrimitives.property.test.ts`. Properties: safeString always returns string, idempotent, preserves valid strings, returns '' for non-strings; safeNumber always finite number, preserves finite numbers, rejects Infinity/NaN; safeBoolean always boolean, preserves true/false; safeArray always array, new reference for array input, preserves length; safeId string or null, null for whitespace, trims valid IDs; normalizePrimitiveForSave never null, preserves booleans, trims strings. (Full test code: BETA_LAUNCH_CHECKLIST.md Phase 3A.10.)

- [ ] **3A.11** Write property-based tests for booking utilities. Create `client/src/utils/booking/__tests__/bookingUtils.property.test.ts`. Properties: total fee never negative; fee with zero quantity is zero; rounded duration >= original; rounded duration is multiple of rounding interval. Adapt imports and function names to actual code. (Full template: BETA_LAUNCH_CHECKLIST.md Phase 3A.11.)

---

## Phase 12.3: Behavioral Alignment Audit

- [ ] **3A.12** Create `client/.scripts/test-alignment-audit.mjs`. Script: find all *.test.ts / *.spec.ts under src; for each file analyze: it-block names (behavioral vs structural), hasNegativeAssertions, hasSpecificValues, hasStructureOnlyChecks, hasDescriptiveHeader, hasPreconditions; compute alignmentScore (0–6), grade A/B/C/D; output `.audit-reports/test-alignment-audit.json` and `test-alignment-audit-summary.md`. (Full script: BETA_LAUNCH_CHECKLIST.md Phase 3A.12.)

- [ ] **3A.13** Add scripts to `client/package.json`: `audit:test-alignment`, `audit:test-alignment:summary`. Register in `audit:all` pipeline.

- [ ] **3A.14** Run audit: `npm run audit:test-alignment`. Review Grade D files first; strengthen assertions, add negative checks, rename tests to describe behavior; re-run to confirm grade improvement.

- [ ] **3A.15** Strengthen Grade D and C test files. Apply fixes: (1) Structure-only → behavioral (precondition + action + postcondition, specific values and .not); (2) Add negative assertions to prove exclusion/filtering; (3) Add precondition assertions for starting state. (Before/after examples: BETA_LAUNCH_CHECKLIST.md Phase 3A.15.)

---

## Phase 12.4: CI Integration & Dashboard

- [ ] **3A.16** Add mutation testing job to `.github/workflows/ci.yml`. Job name: mutation-test, needs: test-client, if: pull_request; steps: checkout, setup-node, npm ci (client), npx stryker run; upload artifact `.mutation-reports/` retention 14 days. Start as non-blocking; promote to required once scores stabilize. (Full YAML: BETA_LAUNCH_CHECKLIST.md Phase 3A.16.)

- [ ] **3A.17** Create `client/.scripts/test-quality-dashboard.mjs`. Run behavioral alignment audit; read alignment report and print summary; check for Stryker report; print recommendations (fix Grade D, target mutation >70%, add property tests). Add script `test:quality` to client/package.json. (Full script: BETA_LAUNCH_CHECKLIST.md Phase 3A.17.)

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mutation testing tool | Stryker Mutator | Mature JS/TS mutation framework; Vitest support |
| Property-based testing | fast-check | Popular, Vitest-native |
| Mutation CI gate | Non-blocking initially | Avoid blocking PRs until scores stable |
| Property test files | Separate `.property.test.ts` | Separate from faster example-based tests |
| Alignment audit | Custom script | Matches existing `.scripts/` audit pattern |

---

## Learning Checkpoint

- **What:** Difference between code coverage and mutation score?
- **Why:** Why can 100% coverage still miss bugs?
- **How:** How does Stryker choose mutations? How does fast-check generate inputs?
- **When:** When property-based vs example-based tests?
- **Where:** Where in CI should mutation testing run?

---

**Last Updated:** 2026-02-18
