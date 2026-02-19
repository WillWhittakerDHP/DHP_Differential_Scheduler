# Dep-freshness remediation notes

## Intentionally not upgraded (false positives)

- **@types/dotenv (server):** Audit "latest" is 6.1.1; we use 8.x. DefinitelyTyped versioning can report an older major as "latest". Keep 8.x.
- **@types/helmet (server):** Audit "latest" is 0.0.48; we use 4.x. Same DT versioning; keep 4.x.

## Deferred (separate migration)

- **vue-router 4 → 5 (client):** Large breaking change; plan as dedicated routing migration.
- **express 4 → 5 (server):** Large breaking change; plan as separate server migration.
- **Tiptap 2 → 3 (client):** starter-kit and extensions have peer dependency on @tiptap/core@^2.x; full upgrade needs coordinated bump of all Tiptap packages. Kept at ^2.11.0.

## Completed

- Phase 1: Patch updates (9 server packages).
- Phase 2: Minor updates (8 packages: client @formkit/drag-and-drop; server eslint-plugin/parser, helmet, pg, supertest, ts-jest, typescript).
- Phase 3: Allowlist/document @types/dotenv and @types/helmet; dep-freshness-audit-config allowlist.
- Phase 4 (major): Client @types/node 25, cookie-es 2, unplugin-auto-import 21, @iconify/vue 5, vue-flatpickr-component 12; server @types/node 25, @types/jest 30, cross-env 10, dotenv 17, dotenv-cli 11, date-fns 4, joi 18, googleapis 171. Server req.params normalized via paramString() helper. Client @formkit/drag-and-drop 0.5 callback signatures updated (performTransfer single arg, handleEnd single arg). Tiptap kept at 2.x (see Deferred).
