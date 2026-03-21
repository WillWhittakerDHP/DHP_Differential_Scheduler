# Feature 9: Guided Alpha Testing

**Purpose:** Validate the product before E2E tests: wizard flow diagram, alpha task database, guided assignment and blank runs, and a single user feedback pipeline for alpha (and beta) plus auto-detected errors.

**PROJECT_PLAN:** See root `.project-manager/PROJECT_PLAN.md` — Feature 9.
**Feature guide (phases, implementation order, session refs):** [feature-guided-alpha-testing-guide.md](feature-guided-alpha-testing-guide.md).

---

## Phases and sessions

| Phase | Description | Session(s) |
|-------|-------------|------------|
| 9.1 | Wizard Flow Diagram (Mermaid) | — |
| 9.2 | Alpha Testing Task Database | — |
| 9.3 | Guided Assignment and Blank Runs | — |
| 9.4 | User Feedback & Error Wiring | **9.4.1** — Rename beta_feedback → user_feedback; add source column; wire Vue error boundary and auto error reporting. |

---

## Session 9.4.1 (User Feedback & Error Wiring)

**Guide:** [sessions/session-9.4.1-guide.md](sessions/session-9.4.1-guide.md)

**Scope:** Rename the existing beta feedback system to **user_feedback** (DB, routes, models, client). Add a **source** column (`user` | `alpha` | `error_boundary` | `console`). Wire Vue error boundary and optional logger to POST into the same API so all feedback and auto-detected errors flow into one pipeline for alpha testing and CI/CD.

**Deliverable:** One queryable user_feedback pipeline for manual feedback (alpha/beta) and auto-reported errors; docs updated.
