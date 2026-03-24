# Plan: task 6.15.3.2 — BookingWizard header logo and verification

## Contract
- **Tier:** task | **ID:** 6.15.3.2
- **Scope:** Public booking wizard UI only. Show **`logoUrl`** from GET `/wizard-settings` in the wizard header when set; resolve relative API paths to absolute URLs; optional broken-image handling. **Out of scope:** further theme math (done in **6.15.3.1**).
- **Governance:** Keep `BookingWizard.vue` thin; add at most a tiny URL helper if needed; log in catch paths per project rules.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** component

## Where we left off
Task **6.15.3.1** wires **`brandPrimaryHex` / `brandSecondaryHex`** into **`useThemeMode`** when Brand colors is on. This task completes session **6.15.3** by surfacing the stored **wizard logo** in the booking UI.

## Goal
When **`logoUrl`** is non-empty in wizard settings, render it in **`BookingWizard`**’s top header area (stepper header) with accessible **`alt`** text and responsive layout. When **`logoUrl`** is null/empty, show **no** logo (current look). Resolve **`logoUrl`** the same way the browser would load the admin-served asset (prefix with app/API origin if the API returns a root-relative path). **Done** after manual smoke (logo on/off, small viewport) and **`cd client && npm run lint`**.

## Files
- `client/src/types/admin/wizardSettings.ts` — extend **`UseWizardSettingsFlagsReturn`** with **`logoUrl: ComputedRef<string | null>`** (or agreed name) sourced from **`wizardData.logoUrl`**.
- `client/src/composables/admin/useWizardSettings.ts` — **`buildWizardSettingsFlags`**: add computed for **`logoUrl`** (trim; empty → `null`).
- `client/src/composables/booking/useBookingWizardSetup.ts` — destructure **`logoUrl`** from **`bookingFlow.wizardSettings.flags`**; return it from the composable for the SFC.
- `client/src/components/booking/BookingWizard.vue` — header: conditional **`VImg`** or **`<img>`** bound to resolved URL; minimal SCSS in **`BookingWizard.scss`** if spacing/height constraints are needed (max-height, object-fit).

## Approach
1. **Expose URL** on the same read-only flags surface as brand hex (single GET / wizard singleton).
2. **Resolve href:** If `logoUrl` starts with `/`, prepend **`window.location.origin`** (or existing axios/API base helper if the app already centralizes public asset roots—match that pattern).
3. **UI:** Place logo beside or above stepper title row without breaking mobile layout; hide block when `logoUrl` is null.
4. **Optional:** `@error` on image → **`logger.warn`** once (no empty catch).
5. **Verify:** Logo visible when configured; no logo when unset; lint clean.

## Checkpoint
- Admin-uploaded logo appears on booking wizard when URL present.
- No regression when `logoUrl` is null.
- Client lint passes; no new tests (Phase 3.0 policy).

## Design Before Execute
- `resolvedWizardLogoUrl = computed(() => { const u = logoUrl.value; if (!u) return null; return u.startsWith('/') ? `${origin}${u}` : u })` — adjust if API always returns absolute URLs.

---
## Reference
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.15.3-planning.md`
- Prior task: `.project-manager/features/appointment-workflow/sessions/task-6.15.3.1-planning.md`
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.15.3-guide.md`
- Playbooks: `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
