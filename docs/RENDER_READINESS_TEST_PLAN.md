# Render Readiness Test Plan

This plan defines the minimum testing work needed before taking Bonsai to Render for alpha. It is intentionally smaller than a full end-to-end test program: pipeline tests prove scheduling correctness; smoke tests prove the deployed app is alive and navigable.

## 1. Straighten Code Shape First

Before adding browser smoke tests, run a focused static review over the files touched by the accumulator, event placement, attendee routing, admin event editor, and Render-readiness UI work.

Look for:

- Deeply nested functions or conditionals.
- Oversized functions that mix lookup, transformation, persistence, and UI concerns.
- Duplicated conditional branches.
- UI-only patches that compensate for missing domain invariants.
- Fallback chains that hide invalid state instead of making it explicit.

If any of those are found in the current workflow path, fix them first by extracting small, flat helpers and adding targeted tests around those helpers.

## 2. Keep Core Scheduling Tests at Pipeline Level

Pipeline tests are the right place to lock scheduling behavior because they avoid browser timing noise and directly exercise the scheduling model.

Required coverage:

- Accumulator inclusion from selected service plus Property Detail Facts.
- Event segment placement for primary, secondary, marginal, and floating segments.
- Minimize Time On Site layout behavior.
- Selected time slot metadata persisted for invite creation.
- Segment-scoped attendee routing through `event_instance_attendees`.

## 3. Add Minimal Render Smoke Tests

Add only enough browser-level coverage to prove the deployed app is usable.

Suggested smoke checks:

- App shell loads.
- Booking wizard route loads.
- Admin route loads.
- Admin opens on `Instances > Users`.
- Top-level `Shapes` tab is reachable.
- Server health/API endpoint responds.

These tests should not attempt to prove every scheduling rule. That remains pipeline-test territory.

Current smoke command:

```bash
npm run smoke:render
```

By default this checks local dev URLs:

- Client: `http://localhost:3002`
- API: `http://localhost:3001`

For Render, pass the deployed URLs:

```bash
RENDER_SMOKE_CLIENT_URL="https://<client-service>.onrender.com" \
RENDER_SMOKE_API_URL="https://<api-service>.onrender.com" \
npm run smoke:render
```

## 4. Manual Alpha Checklist

Some alpha checks should stay manual because they involve auth, production credentials, or live Google Calendar behavior.

Manual checks:

- Magic-link auth request and verification.
- Admin can edit real catalog data.
- Standard booking completes.
- Differential booking completes.
- Minimize Time On Site booking produces the expected calendar segments.
- Google Calendar invite creation matches the selected event segment layout.

## 5. Render Gate

Before deployment:

- Client typecheck.
- Client lint.
- Client unit/pipeline tests.
- Client production build.
- Server build.
- Server lint.
- Migration dry run or local migration verification against the intended schema.

After deployment:

- Run smoke checks against the Render URL.
- Complete the manual alpha checklist.

## Guiding Trade-Off

Use pipeline tests for correctness and smoke tests for deployment confidence. A full browser E2E suite can wait until after alpha unless the Render deployment reveals repeated browser-only failures.
