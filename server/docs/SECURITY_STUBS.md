# Security middleware stubs

The middleware in `src/middlewares/security.ts` are **intentional no-op stubs** until authentication is implemented. They are wired into state-changing routes now so that the security layer can be dropped in later without changing route definitions.

## Planned behavior

### csrfProtection

- Extract CSRF token from request header (e.g. `X-CSRF-Token`).
- Compare against session/token store.
- Reject requests with invalid or missing tokens (e.g. 403 Forbidden).

### requireAuth (when exposed)

- Extract token from `Authorization` header or cookie.
- Verify token (e.g. JWT signature, expiration).
- Attach user object to `req.user`.
- Reject requests with invalid or missing tokens (e.g. 401 Unauthorized).

### checkOwnership

- Extract resource ID from `req.params[paramKey]`.
- Load resource (e.g. `Model.findByPk(resourceId)`).
- If no resource, return 404.
- If `resource[ownerField] !== req.user.id`, return 403.
- Optionally attach resource to `req` for the route handler.

## Reference

- Implementation: `server/src/middlewares/security.ts`
