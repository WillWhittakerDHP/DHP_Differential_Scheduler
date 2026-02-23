# Security middleware stubs

The middleware in `src/middlewares/security.ts` are **intentional no-op stubs** until authentication is implemented. They are wired into state-changing routes now so that the security layer can be dropped in later without changing route definitions.

## Planned behavior

### csrfProtection

- Extract CSRF token from request header (e.g. `X-CSRF-Token`).
- Compare against session/token store.
- Reject requests with invalid or missing tokens (e.g. 403 Forbidden).

### requireAuth

- **Current (stub):** Exported from `security.ts` but not yet applied to any route; passes all requests through. Code that will consume auth (e.g. appointment hold) uses `req.user` only when present.
- **Planned (Feature 7):**
  - Extract token from `Authorization` header or cookie.
  - Verify token (e.g. JWT signature, expiration).
  - Attach user object to `req.user` (e.g. `{ id: string, ... }`).
  - Reject requests with invalid or missing tokens (e.g. 401 Unauthorized).
- **Held-status usage:** When a client holds an appointment slot (`PATCH /appointments/:id` with `status: 'held'`), the server will set `held_by` to `req.user.id` once `requireAuth` is enacted and the route is protected. Until then, `held_by` remains `null` and the client "Hold Slot" button is disabled with a tooltip.

### requireRole

- **Current (stub):** Exported from `security.ts`; accepts role names but passes all requests through without checking. No routes currently apply it.
- **Planned (Feature 7):**
  - Read `req.user.role` (set by `requireAuth` upstream).
  - Check if the user's role is in the allowed roles list.
  - Return 403 Forbidden if the user lacks the required role.
- **Override usage:** When an admin applies constraint overrides (`PATCH /appointments/:id` with `overrideConstraints`), the server will require `requireRole('admin')` on that route so only admins can bypass slot computation constraints. Until enacted, the Override Constraints button is disabled in the client.

### checkOwnership

- Extract resource ID from `req.params[paramKey]`.
- Load resource (e.g. `Model.findByPk(resourceId)`).
- If no resource, return 404.
- If `resource[ownerField] !== req.user.id`, return 403.
- Optionally attach resource to `req` for the route handler.

## Stub → real implementation mapping

| Stub | Location | Enactment (Feature 7) |
|------|----------|------------------------|
| `requireAuth` | `server/src/middlewares/security.ts` | Replace no-op with JWT/session verification; attach `req.user`. |
| `requireRole` | `server/src/middlewares/security.ts` | Replace no-op with role check against `req.user.role`; return 403 if role not in allowed list. |
| Appointment hold `heldBy` | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (sanitizeInput) | Replace `appointmentFields.heldBy = null` with `appointmentFields.heldBy = req.user?.id ?? null` (or require auth on PATCH and use `req.user.id`). |
| Appointment `overrideConstraints` | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (sanitizeInput) | Apply `requireRole('admin')` middleware to PATCH route (or the override-specific branch) so only admins can set `overrideConstraints`. |
| Client "Hold Slot" button | Client booking wizard | Remove `disabled` and tooltip; wire button to `holdSlot()` when auth is present. |
| Client "Override Constraints" button | Client admin appointments table | Remove `disabled` and tooltip; wire button to `applyOverrideConstraints()` when admin role is verified. |

## Phase 6.2 → Phase 6.7 relationship

Phase 6.2 establishes **stub foundations** for both held-status and admin constraint overrides. Phase 6.7 (Admin Force-Create & Constraint Overrides) will build the full implementation on top:

| Phase 6.2 (Stub) | Phase 6.7 (Full) |
|---|---|
| `override_constraints` JSONB column stores boolean flags | Full constraint engine reads these flags during slot computation |
| `sanitizeInput` validates keys against `ALLOWED_OVERRIDE_CONSTRAINTS` | Constraint override UI with per-constraint toggles and reason tracking |
| `requireRole('admin')` stub passes all requests | Real role check gates override-capable routes |
| Disabled "Override" button in admin table | Active override dialog with constraint picker and confirmation |

## Reference

- Implementation: `server/src/middlewares/security.ts`
- Appointment hold logic: `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`beforeUpdate`, `sanitizeInput`)
- Appointment override logic: `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`sanitizeInput`)
- Allowed override keys: `server/src/routes/internal/appointments/appointmentConstants.ts` (`ALLOWED_OVERRIDE_CONSTRAINTS`)
