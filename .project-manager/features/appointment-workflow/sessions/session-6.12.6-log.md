# Session 6.12.6: Event instance admin and template preview

## Session status

**Status:** Complete (retro-documented; verify UI against branch)  
**Phase:** 6.12  
**Last updated:** 2026-03-21

---

## Completed tasks

### Task 6.12.6.1: Event instance builder, editor, calendar settings, invite preview

**Goal:** Admin instances tab components for event instances (list, editor body, template ref, variable chips, preview panel); internal preview API + `eventInstancePreviewService`; shared helpers (`buildSampleInviteContext`, `eventTemplateResolver`, `templateVariableWarnings`). Preview must not send real invites.  
**Planning:** `sessions/task-6.12.6.1-planning.md`

---

## Test status

Manual: create/edit event instance, open preview, confirm no outbound calendar send from preview path.

---

## Technical reference (backfill)

### Purpose

Admin workflows for **event instances**: template reference, calendar/invite-related settings, and **preview** of rendered invite content.

### Components (representative)

- `EventInstance*.vue` under `client/src/views/admin/tabs/components/`
- `eventInstancePreviewApi.ts`
- Server: `server/src/routes/internal/event-instance-preview/` (if mounted), `eventInstancePreviewService.ts`
- Shared: `buildSampleInviteContext.ts`, `eventTemplateResolver.ts`, `templateVariableWarnings.ts`

### API boundaries

- Preview returns resolved strings or structured payload only — **no** real invite send.

### Follow-ups

- [ ] Confirm auth / rate limits for preview route in production.
- [ ] Short admin note: where preview lives in UI.

<!-- end excerpt session -->
